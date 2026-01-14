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
    if (!item) {
      return res.status(400).json({ message: 'Item not found brev' })
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } }
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
    if (!item) {
      return res.status(400).json({ message: 'Item not found brev' })
    }
    return res.status(200).json(item);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error Getting item with that ID: ${error}` });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const items = await Item.findByIdAndDelete(itemId)
    if (!items) {
      return res.status(400).json({ message: 'Item not found brev' })
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
};

export const getItemsByCity = async (req, res) => {
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
      };

      return cityMap[normalized] || normalized;
    };

    const normalizedCity = normalizeCity(city);

    console.log(`🔍 Searching items for city: "${city}" → normalized: "${normalizedCity}"`);

    const shops = await Shop.find({
      $or: [
        { city: { $regex: new RegExp(`^${normalizedCity}$`, "i") } },
        { city: { $regex: new RegExp(normalizedCity, "i") } }
      ]
    });

    if (shops.length === 0) {
      console.log(`❌ No shops found for city: "${city}"`);
      return res.status(200).json([]);
    }

    const shopIds = shops.map(shop => shop._id);

    const items = await Item.find({
      shop: { $in: shopIds }
    }).populate('shop', 'name city');

    console.log(`Found ${items.length} items across ${shops.length} shops`);

    return res.status(200).json(items);
  } catch (error) {
    console.error("❌ Error in getItemsByCity:", error);
    return res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params
    const shop = await Shop.findById(shopId).populate("items")
    if (!shop) {
      return res.status(400).json({ message: 'Shop not found brev' })
    }
    return res.status(200).json({
      shop,
      items: shop.items
    });
  } catch (error) {
    return res.status(500).json({ message: `Error fetching items by shop: ${error.message}` })
  }
};

export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
    
    // Validate input
    if (!query || !city) {
      return res.status(400).json({ 
        message: "Both query and city parameters are required" 
      });
    }

    // Normalize city name for consistent searching
    const normalizeCity = (cityName) => {
      if (!cityName) return "";
      const normalized = cityName.toLowerCase().trim();
      
      const cityMap = {
        'wah': 'wah cantt',
        'wah cantt': 'wah cantt',
        'islamabad': 'islamabad',
        'rawalpindi': 'rawalpindi',
      };
      
      return cityMap[normalized] || normalized;
    };
    
    const normalizedCity = normalizeCity(city);
    
    console.log(`🔍 Searching for "${query}" in city: "${city}" → "${normalizedCity}"`);

    // First, get shops in the current city
    const shops = await Shop.find({
      $or: [
        { city: { $regex: new RegExp(`^${normalizedCity}$`, "i") } },
        { city: { $regex: new RegExp(normalizedCity, "i") } }
      ]
    });

    if (!shops || shops.length === 0) {
      console.log(`❌ No shops found for city: "${city}"`);
      return res.status(200).json({
        items: [],
        shops: [],
        message: `No shops found in ${city}`
      });
    }

    const shopIds = shops.map(s => s._id);
    
    // Search for items that match the query AND are from shops in the current city
    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ]
    }).populate('shop', 'name city image address rating');

    // Also search for shops by name in the current city
    const matchingShops = await Shop.find({
      _id: { $in: shopIds },
      name: { $regex: query, $options: "i" }
    }).select('name image city address rating');

    console.log(`✅ Found ${items.length} items and ${matchingShops.length} shops matching "${query}" in ${city}`);

    return res.status(200).json({
      items: items,
      shops: matchingShops,
      totalResults: items.length + matchingShops.length,
      city: city
    });
    
  } catch (error) {
    console.error("❌ Error in searchItems:", error);
    return res.status(500).json({ 
      message: `Error searching items: ${error.message}` 
    });
  }
};