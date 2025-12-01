import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    let shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          image,
          owner: req.userId,
        },
        { new: true }
      );
    }
    await shop.populate("owner items");
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Creating Shop Error ${error}` });
  }
};

export const getShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } }
      });

    if (!shop) {
      return res.status(200).json(null);
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Error Getting Shop: ${error}` });
  }
};

export const getShopCity = async (req, res) => {
  try {
    const {city} = req.params
    
    const shop = await Shop.find({
      city:{$regex:new RegExp(`^${city}$`,"i")}
    }).populate('items')
    
    if(!shop || shop.length === 0){
      return res.status(400).json({message:'Sorry, No Shop found in your City'})
    }
    return res.status(200).json(shop)
  } catch (error) {
      return res.status(500).json({message:`Error getting Shops by city: ${error}` })
  }
}
