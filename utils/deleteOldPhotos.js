const { readdir, unlink } = require("node:fs/promises");
const path = require("path");

const catchAsync = (asyncFunction) => {
  return (request, response, next) => {
    asyncFunction(request, response, next).catch((error) => {
      console.log(error);
      next(error);
    });
  };
};

exports.deleteOldAvatar = catchAsync( async(updatedUser) => {
  console.log("user ==> ", updatedUser);
  const folderPath = path.join(__dirname, "..", "public", "img", "users");
  console.log("folder ==> ",folderPath);
    
  const allPhotos = await readdir(folderPath); // returns an obj .
  
  Object.values(allPhotos).forEach(async photo => {
    // 1) Getting the photo.id part from the updatedUser and check if there is any photo with the same id :
    const photoID = photo.split("-")[1]; 
    // 2) Deleting ONLY if the photo IS NOT the NEW one:
    if(photoID === updatedUser.id && photo !== updatedUser.photo) {        
        await unlink(`${folderPath}/${photo}`);
        // console.log("the photo was deleted", `${folderPath}/${photo}`);
    }
  });

});

exports.deleteOldImages = catchAsync( async(updatedTour, tourID) => {
  // console.log("tour ==> ", updatedTour);
  const folderPath = path.join(__dirname, "..", "public", "img", "tours"); 
  console.log("folder ==> ",folderPath);
  const allImages = await readdir(folderPath); // returns an obj .

  if(updatedTour.imageCover){
    Object.values(allImages).forEach(async cover => {
      if(cover.includes("cover")) { // to limit the loop process for only Tours' covers .
        // console.log("cover ==> ", cover);
        const coverID = cover.split("-")[1];         
        if(coverID === tourID && cover !== updatedTour.imageCover) {     
            await unlink(`${folderPath}/${cover}`);
            // console.log("the cover was deleted", `${folderPath}/${cover}`);
        }
    }
    });
  }

  if(updatedTour.images) {
    
    Object.values(allImages).forEach(async (image) => {
      if(!image.includes("cover")){
      // 1) Getting the image.id part from the updatedUser and check if there is any image with the same id :
      const imageID = image.split("-")[1];
      // 2) Deleting ONLY if the image IS NOT the NEW one:
      if(imageID === tourID && !updatedTour.images.includes(image)) {                
          await unlink(`${folderPath}/${image}`);
          // console.log("the photo was deleted", `${folderPath}/${image}`);
      }}
    });
  }

});

/*

- How to differentiate between Object.keys / Object.values / Object.entries :

const zoo = {
  lion: '🦁',
  panda: '🐼',
};

Object.keys(zoo);
// ['lion', 'panda']

Object.values(zoo);
// ['🦁', '🐼']

Object.entries(zoo);
// [ ['lion', '🦁'], ['panda', '🐼'] ]
*/