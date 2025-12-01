import multer, { diskStorage } from 'multer'


//send the image from the public to the req.file to be uploaded to cloudinary
const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, './public')
    },
    filename:(req, file, cb)=>{
        cb(null, file.originalname)
    }
})

export const upload= multer({storage});