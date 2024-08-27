import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)   //ye file ko random name dene k liye use krty hain
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
    cd (null,file.originalname) // is se orginal name he rehta hai file ka
    }
  })
  
  export const upload = multer(
    { 
    storage
    }
    )