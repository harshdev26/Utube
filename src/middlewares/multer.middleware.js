import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")  // this is the destination where all files will be stored by the users with the help of multer.
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname)
  }
})

const upload = multer({ 
    storage, 
})

export {upload}