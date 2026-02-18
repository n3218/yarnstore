import asyncHandler from 'express-async-handler';
import sharp from 'sharp';
import Product from '../models/productModel.js';
import bucket from '../config/bucket.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
dotenv.config();

const makeSafeFileName = originalname => {
  const ext = path.extname(originalname).toLowerCase() || '.jpg';

  let base = path
    .basename(originalname, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!base) base = 'img';

  // 🔥 обрезаем до 15 символов
  base = base.slice(0, 15);

  const random = crypto.randomBytes(3).toString('hex');

  return `${Date.now()}-${base}-${random}${ext}`;
};
//
//
// upload single file to GCloud Bucket
// upload single file to GCloud Bucket
const blobAction = (size, fileData) => {
  return new Promise((resolve, reject) => {
    if (!fileData?.buffer) return reject(new Error(`No buffer for ${size}/${fileData?.originalname}`));
    // const blob = bucket.file(`${size}/${fileData.originalname}`);
    const safeName = makeSafeFileName(fileData.originalname);
    const blob = bucket.file(`${size}/${safeName}`);

    const blobStream = blob.createWriteStream({
      resumable: false,
      // public: true, // ок, но доступ лучше задавать IAM/ACL, см. ниже
      metadata: { contentType: fileData.mimetype || 'image/jpeg' }
    });

    const baseUrl = `https://storage.googleapis.com/${process.env.GCLOUD_BUCKET}`;

    blobStream
      .on('error', err => {
        console.log('Error on blobStream:', err);
        reject(err);
      })
      .on('finish', () => {
        const publicUrl = `${baseUrl}/${blob.name}`;
        console.log('FINISHED UPLOAD', publicUrl);
        resolve({
          // ...fileData,
          originalname: fileData.originalname,
          image: publicUrl,
          size,
          path: blob.name
        });
      })
      .end(fileData.buffer);
  });
};

//
//
// render and upload to GCloud all images for single product (fullsize, thumb amd minithumb)
const uploadResizedImages = async file => {
  try {
    // 1) fullsize
    // const fullsizePromise = await blobAction('fullsize', file);
    const full = await blobAction('fullsize', file);
    // 2) thumbs
    // const thumbsBuffer = await sharp(file.buffer).resize(250, 250).toFormat('jpeg').jpeg({ quality: 100 }).toBuffer();
    // const thumbsPromise = await blobAction('thumbs', { buffer: thumbsBuffer, originalname: file.originalname, mimetype: 'image/jpeg' });
    const thumbsBuffer = await sharp(file.buffer).resize(250, 250).jpeg({ quality: 100 }).toBuffer();
    const thumbs = await blobAction('thumbs', { buffer: thumbsBuffer, originalname: file.originalname, mimetype: 'image/jpeg' });

    // 3) minithumbs
    // const miniBuffer = await sharp(file.buffer).resize(80, 80).toFormat('jpeg').jpeg({ quality: 100 }).toBuffer();
    // const minithumbsPromise = await blobAction('minithumbs', { buffer: miniBuffer, originalname: file.originalname, mimetype: 'image/jpeg' });
    const miniBuffer = await sharp(file.buffer).resize(80, 80).jpeg({ quality: 100 }).toBuffer();
    const mini = await blobAction('minithumbs', { buffer: miniBuffer, originalname: file.originalname, mimetype: 'image/jpeg' });

    // ждём ВСЁ и возвращаем результаты
    return [full, thumbs, mini];
  } catch (err) {
    console.log('Error in uploadResizedImages:', err);
    throw err; // важно: пусть API вернёт 500, а не “тихо съест”
  }
};

// @desc   Upload Images for single Product
// @route  POST /api/upload/
// @access Private/+Admin
export const uploadProductImages = asyncHandler(async (req, res) => {
  try {
    // const results = await Promise.all(req.files.map(file => uploadResizedImages(file)));
    const results = await Promise.all(req.files.map(uploadResizedImages));
    // if (results) {
    //   setTimeout(() => {
    //     console.log("uploadProductImages: req.files.length: ", req.files.length)
    //     console.log("uploadProductImages: results.length: ", results.length)
    //     res.json(req.files)
    //   }, 9000)
    // }
    console.log('ABOUT TO RESPOND uploadProductImages');
    // results сейчас будет массив массивов: [[full, thumb, mini], [full, thumb, mini], ...]
    const flat = results.flat();
    res.json(flat);
  } catch (err) {
    console.error('Error in uploadProductImages: ', err);
    res.status(500);
    throw new Error(err.message || 'Problem with uploading Images');
  }
});

export const makeProdMap = async files => {
  const productMap = new Map();

  try {
    await Promise.all(
      files.map(async file => {
        if (file.originalname) {
          const productArt = file.originalname.replace(/[ a-z.]+/g, '').split('-')[0];
          console.log('uploadBulkImages: productArt: ', productArt);
          if (productMap.has(productArt)) {
            productMap.set(productArt, {
              images: [...productMap.get(productArt).images, file.originalname],
              files: [...productMap.get(productArt).files, file]
            });
          } else {
            productMap.set(productArt, {
              images: [file.originalname],
              files: [file]
            });
          }
        }
      })
    ); // fill the prodMap with values

    return productMap;
  } catch (err) {
    console.error('Error on generating images: ', err);
    res.status(404);
    throw new Error('Error on generating images', err);
  }
};

// @desc   Upload Bulk Images and connecting to Products
// @route  POST /api/upload/bulk
// @access Private/+Admin
export const uploadBulkImages = asyncHandler(async (req, res) => {
  const products = [];
  const notFound = [];
  const totalSize = (req.files.reduce((acc, el) => acc + el.size, 0) / 1024 / 1024).toFixed(1);
  const expectedTime = totalSize * 500;
  console.log('uploadBulkImages: totalSize: ', totalSize);

  const prodMap = await makeProdMap(req.files);
  console.log('----------------------------prodMap: ', prodMap);
  if (prodMap) {
    console.log('========================');
    // Promise.all(
    await prodMap.forEach(async (value, key) => {
      const product = await Product.findOne({ art: key });
      if (product) {
        prodMap.get(key).files.map(file => {
          uploadResizedImages(file);
        });
        product.image = value.images;
        console.log('product.image: ', product.image);
        try {
          const updatedProduct = await product.save();
          products.push(updatedProduct);
          return updatedProduct;
        } catch (err) {
          console.log('Error on updating product: ', err);
        }
      } else {
        console.log('ELSE: ');
        notFound.push(key);
        return 'Product not found';
      }
    });
    // .then(res => {
    //   console.log("res: ", res)
    // })
    setTimeout(async () => {
      console.log('products.length: ', products.length);
      console.log('notFound: ', notFound);
      let [fullsizeFiles] = await bucket.getFiles({ prefix: 'fullsize' });
      let [thumbsFiles] = await bucket.getFiles({ prefix: 'thumbs' });
      let [minithumbsFiles] = await bucket.getFiles({ prefix: 'minithumbs' });

      console.log('fullsizeFiles.length: ', fullsizeFiles.length);
      console.log('thumbsFiles.length: ', thumbsFiles.length);
      console.log('minithumbsFiles.length: ', minithumbsFiles.length);

      res.json({ products, notFound, fullsizeFiles: fullsizeFiles.length, thumbsFiles: thumbsFiles.length, minithumbsFiles: minithumbsFiles.length });
    }, expectedTime);

    // ).then(res => console.log("res: ", res))
    // console.log("data: ", data)

    // console.log("uploadBulkImages: products: ", products)
  }
  // try {

  // } catch (err) {
  //   console.error("Error on updating products after uploading images: ", err)
  //   res.status(404)
  //   throw new Error("Error on updating products after uploading images", err)
  // }
});

//
//
// delete all files in folder exept undefined
const deleteAllFilesInFolder = async folder => {
  try {
    let [files] = await bucket.getFiles({ prefix: folder });
    console.log('deleteAllFilesInFolder: ', folder, '-', files.length);
    let dirFiles = files.filter(f => f.name.includes(folder) && !f.name.includes('undefined'));
    console.log('deleteAllFilesInFolder: filteredFilesToDelete: ', folder, '-', dirFiles.length);

    dirFiles.forEach(async file => {
      try {
        return await file.delete();
      } catch (err) {
        console.log('Error on deleting file: ', err);
      }
    });
    return ' Deleted ' + dirFiles.length + ' files in folder ' + folder;
  } catch (err) {
    console.log('Error: ', err);
  }
};

// @desc   Delete All Images in product images derectories(FullSize, Thumbs, Minithumbs)
// @route  DELETE /api/upload/bulk
// @access Private/+Admin
export const deleteImages = asyncHandler(async (req, res) => {
  console.log('deleteImages');
  await Promise.all([deleteAllFilesInFolder('fullsize'), deleteAllFilesInFolder('thumbs'), deleteAllFilesInFolder('minithumbs')])
    .then(results => {
      console.log('results: ', results);
      console.log('OK');
      const message = results.toString();
      console.log('message: ', message);
      res.json({ message: message });
    })
    .catch(err => {
      res.status(404);
      throw new Error('Problem with deleting Images', err);
    });
});
