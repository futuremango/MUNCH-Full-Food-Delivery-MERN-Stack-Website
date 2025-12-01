import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    
    // ✅ FIRST find shop
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "Shop not Found!" });
    }
    
    // ✅ THEN check for existing item (now shop is defined)
    const existingItem = await Item.findOne({ 
      name: name,
      shop: shop._id  
    });
    
    if (existingItem) {
      return res.status(400).json({ message: "Item already exists!" });
    }
    
    const Newitem = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    });
    
    shop.items.push(Newitem._id);
    await shop.save();
    
    const updatedShop = await Shop.findById(shop._id).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } }
    });

    return res.status(201).json(updatedShop);
  } catch (error) {
    return res.status(500).json({ message: `Error Adding Items in Shop: ${error}` });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        foodType,
        price,
         ...(image && { image }),
      },
      { new: true }
    );
    if(!item){
        return res.status(400).json({message:'Item not found brev'})
    }
    const shop = await Shop.findOne({owner:req.userId}).populate({
      path:"items",
      options:{sort:{updatedAt:-1}}
    });
    
    if (!shop) {
      return res.status(400).json({ message: "Shop not found!" });
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error Editing item in Shop: ${error}` });
  }
};

export const getItemByID = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const item = await Item.findById(itemId)
    if(!item){
      return res.status(400).json({message:'Item not found brev'})
    }
    return res.status(200).json(item);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error Getting item with that ID: ${error}` });
  }
}

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const items = await Item.findByIdAndDelete(itemId)
    if(!items){
      return res.status(400).json({message:'Item not found brev'})
    }
    const shop = await Shop.findOne({ items: itemId });
    if (!shop) {
      return res.status(400).json({ message: "Shop not found!" });
    }
    shop.items = shop.items.filter(item => item.toString() !== itemId);
    await shop.save();

    const updatedShop = await Shop.findById(shop._id).populate("items");
    return res.status(201).json(updatedShop)
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error Delete item in Shop: ${error}` });
  }
}