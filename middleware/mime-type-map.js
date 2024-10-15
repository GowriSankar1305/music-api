const contentMap = new Map();
contentMap.set('image/jpeg','.jpeg');
contentMap.set('image/jpg','.jpg');
contentMap.set('image/png','.png');
contentMap.set('image/bmp','.bmp');
contentMap.set('image/svg+xml','.svg');
contentMap.set('image/tiff','.tiff');
contentMap.set('image/webp','.webp');

exports.fetchExtension = (key) => {
    return contentMap.get(key);
}