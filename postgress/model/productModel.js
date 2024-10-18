import { DataTypes } from "sequelize";

export const createProductModel = async (sequelize)=>{

    const Product  = await sequelize.define("Product",{
        productId:{
            type:DataTypes.STRING,
            allowNull:false,
            primaryKey:true,
            unique:true
        },
        productName:{
            type:DataTypes.STRING,
            allowNull:false
        },
        price:{
            type:DataTypes.FLOAT,
            allowNull:false
        },
        description:{
            type:DataTypes.STRING,
            allowNull:false
        },
        
        
    },{
        timestamps: true, // Enables createdAt and updatedAt fields
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        
    })
    return Product;
}