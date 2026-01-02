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
    const { city } = req.params;
    
    if (!city || city === "null" || city === "undefined") {
      return res.status(200).json([]);
    }
    
    const normalizeCity = (cityName) => {
      if (!cityName) return "";
      const normalized = cityName.toLowerCase().trim();
      
      const cityMap = {
        'wah': 'wah cantt',
        'wah cantt': 'wah cantt',
        'islamabad': 'islamabad',
        'rawalpindi': 'rawalpindi',
        'lhr': 'lahore',
        'lahore': 'lahore',
        'khi': 'karachi',
        'karachi': 'karachi',
      };
      
      return cityMap[normalized] || normalized;
    };
    
    const normalizedCity = normalizeCity(city);
    
    console.log(`🔍 Searching shops for city: "${city}" → normalized: "${normalizedCity}"`);
    
    const shops = await Shop.find({
      $or: [
        { city: { $regex: new RegExp(`^${normalizedCity}$`, "i") } },
        { city: { $regex: new RegExp(normalizedCity, "i") } },
        { city: { $regex: new RegExp(city.replace(/cantt|colony|town/i, "").trim(), "i") } }
      ]
    }).populate('items').populate('owner', 'name email');
    
    console.log(` Found ${shops.length} shops for "${city}"`);
    
    return res.status(200).json(shops);
  } catch (error) {
    console.error("❌ Error in getShopCity:", error);
    return res.status(500).json({message: `Server Error: ${error.message}`});
  }
};