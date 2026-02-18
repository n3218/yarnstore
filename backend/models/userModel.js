import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    storecredit: { type: Number, required: true, default: 0 },
    phone: { type: String, required: false, default: '' },
    googleId: { type: String },
    favorites: [
      {
        art: { type: String, required: false },
        brand: { type: String, required: false },
        name: { type: String, required: false },
        color: { type: String, required: false },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product'
        }
      }
    ],
    address: {
      address: { type: String, required: false, default: '' },
      city: { type: String, required: false, default: '' },
      zipCode: { type: String, required: false, default: '' },
      country: { type: String, required: false, default: '' }
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
