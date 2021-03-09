import React from "react"
import { Jumbotron, Image } from "react-bootstrap"
import Meta from "../components/Meta"
import FormContainer from "../components/FormContainer"
import { UPLOADS } from "../constants/commonConstans"

const AboutScreen = () => {
  return (
    <Jumbotron>
      <Meta title="About | Woolunatics" />
      <FormContainer>
        <h1>About Me</h1>
        <Image src={`${UPLOADS}/elena.jpg`} width="200" align="left" className="mr-4" roundedCircle />
        <p>Приветствую всех в моем "магазине на диване". Кто еще не в курсе - я @elena_knit_nl, живу 16 лет в Нидерландах, родом из Киева, вяжу, много и регулярно, и предпочитаю натуральные составы. По-началу покупала пряжу под свои проекты, а когда моя коллекция стала увеличиваться быстрее, чем я успевала вязать и был проявлен интерес со стороны вяжущих, то решила закупать и не только для себя. Именно закупка и ожидание новой пряжи - самый увлекательный процесс в торговле пряжей, для меня, по крайней мере.</p>
        <p>Пряжа в моем магазине - сток текстильного производства. Поэтому под заказ закупать и ожидать повтор - не реально. Я стараюсь закупать пряжу в метраже, удобном для ручного вязания. Если вам нужна пряжа для машины, тоньше, обращайтесь в директ.</p>
        <p>Если цена указана за 100, гр, то возможен отмот ручной (не размот на несколько мотков!) так, чтобы на бобине оставалось не меньше 300 гр при метраже 1500м/100 гр. !! Минимальный отмот кашемира и тонкого мохера - 200 гр, остальные артикулы - 300 гр. Гребенной меринос - без отмота. Если пряжа толще, то обычно она предлагается бобиной.</p>
        <p>В постах наличие актуальное, но вес нужно уточнять.</p>
        <p>Пересылка - DHL (кроме России и Беларуси), и UPS или Post Nl в Россию и Беларусь.</p>
      </FormContainer>
    </Jumbotron>
  )
}

export default AboutScreen
