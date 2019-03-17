const imageFolder = './images/';
const outputFolder = './output/';
const fs = require('fs');
const Promise = require('bluebird');
const gm = require('gm');
const uuid = require('uuid')

const IMAGES_PER_ROW = 4;
const IMAGES_PER_COL = 3;

const files = fs.readdirSync(imageFolder).filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

Promise.each(files, (file) => {
    const imagePath = `${imageFolder}${file}`
    console.log(imagePath);
    return getImagesize(imagePath)
        .then((size) => crop(imagePath, size));
    }
)


const crop = (imagePath, size) => {
    const imagesParameters = []; 
    for(var i = 0 ; i < IMAGES_PER_ROW ; i++) {
        for(var j = 0 ; j < IMAGES_PER_COL ; j++) {

            imagesParameters.push({ 
                width: Math.floor(size.width / IMAGES_PER_ROW),
                height: Math.floor(size.height / IMAGES_PER_COL),
                x: size.width * i / IMAGES_PER_ROW,
                y: size.height * j / IMAGES_PER_COL,
            });

        }
    }
    return Promise.map(imagesParameters, imagesParameter => {
        return new Promise((resolve, reject) => {
            gm(imagePath)
                .crop(imagesParameter.width, imagesParameter.height, imagesParameter.x, imagesParameter.y)
                .write(`${outputFolder}${uuid.v4()}.png`, (err) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(size);
                });
        })
    })
};

const getImagesize = (imagePath) => 
     new Promise((resolve, reject) => {
        gm(imagePath)
        .size(function (err, size) {
          if (err) {
            reject(err)
          }
          resolve(size);
    });
});
