import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: to,
      subject: "Verify Your Account - Food Delivery",
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {   
            font-family: 'Arial', sans-serif; 
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            margin: 0; 
            padding: 40px 0;
        }
        .container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 20px; 
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #ff6b35, #f7931e); 
            padding: 30px; 
            text-align: center; 
            color: white;
        }
        .content { 
            padding: 40px 30px; 
            text-align: center;
        }
        .otp-code { 
            font-size: 42px; 
            font-weight: bold; 
            color: #ff6b35; 
            letter-spacing: 8px;
            margin: 30px 0;
            background: #fff9f6;
            padding: 15px;
            border-radius: 12px;
            border: 2px dashed #ff6b35;
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #666;
            font-size: 12px;
        }
        .button {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 50px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; font-size: 28px;">🍕 Food Delivery</h1>
            <p style="margin:10px 0 0; opacity: 0.9;">Verify Your Account</p>
        </div>
        
        <div class="content">
            <h2 style="color: #333; margin-bottom: 10px;">Hello Foodie! 👋</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                You're one step away from accessing delicious food deliveries. 
                Use the OTP below to verify your account:
            </p>
            
            <div class="otp-code">${otp}</div>
            
            <p style="color: #888; font-size: 14px; margin: 25px 0;">
                This OTP will expire in <strong>1 minute</strong>. 
                If you didn't request this, please ignore this email.
            </p>
            
            <a href="/forgot-password" class="button">Verify My Account</a>
        </div>
        
        <div class="footer">
            <p style="margin:0;">&copy; 2024 Food Delivery. All rights reserved.</p>
            <p style="margin:5px 0 0; color: #999;">
                Serving deliciousness to your doorstep 🚀
            </p>
        </div>
    </div>
</body>
</html>
            `,
    });
    console.log(`OTP email sent to ${to}`);
  } catch (error) {
    console.log("Email sending error:", error);
    throw error; // Re-throw so calling function can handle it
  }
};

export const verifyDeliveryOtpMail = async (user, otp) => {
  try {
    if (!user || !user.email) {
      console.error("User or user email is undefined:", user);
      throw new Error("User email is required to send OTP");
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email, // Make sure this is a valid email string
      subject: "Delivery Verification OTP - Food Delivery",
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {   
            font-family: 'Arial', sans-serif; 
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            margin: 0; 
            padding: 40px 0;
        }
        .container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 20px; 
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #ff6b35, #f7931e); 
            padding: 30px; 
            text-align: center; 
            color: white;
        }
        .content { 
            padding: 40px 30px; 
            text-align: center;
        }
        .otp-code { 
            font-size: 42px; 
            font-weight: bold; 
            color: #ff6b35; 
            letter-spacing: 8px;
            margin: 30px 0;
            background: #fff9f6;
            padding: 15px;
            border-radius: 12px;
            border: 2px dashed #ff6b35;
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #666;
            font-size: 12px;
        }
        .button {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 50px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; font-size: 28px;">🍕 Food Delivery</h1>
            <p style="margin:10px 0 0; opacity: 0.9;">Delivery Verification</p>
        </div>
        
        <div class="content">
            <h2 style="color: #333; margin-bottom: 10px;">Hello ${user.fullName || 'Customer'}! 👋</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Your delivery partner is waiting to verify the delivery. 
                Please share this OTP with them to complete the delivery:
            </p>
            
            <div class="otp-code">${otp}</div>
            
            <p style="color: #888; font-size: 14px; margin: 25px 0;">
                ⚠️ <strong>Important:</strong> Only share this OTP with the verified delivery partner at your doorstep.
                <br>This OTP will expire in <strong>1 minute</strong>.
            </p>
            
            <p style="color: #ff0000; font-size: 14px; margin: 25px 0; padding: 10px; background: #fff0f0; border-radius: 8px;">
                🔒 <strong>Security Note:</strong> Never share this OTP with anyone who calls you asking for it.
            </p>
        </div>
        
        <div class="footer">
            <p style="margin:0;">&copy; 2024 Food Delivery. All rights reserved.</p>
            <p style="margin:5px 0 0; color: #999;">
                Delivering happiness to your doorstep 🚀
            </p>
        </div>
    </div>
</body>
</html>
      `,
    });
    console.log(`Delivery OTP email sent to ${user.email}`);
  } catch (error) {
    console.error("Delivery OTP email sending error:", error);
    throw error;
  }
};