import { AppError } from "../middlewares/errorMiddleware.js";
import { sequelize } from "../postgress/postgress.js";

const authController = {
  login: async (req, res, next) => {
    try {
      const { empId } = req.params;
      // Raw SQL query to get orders with product details
      const orders = await sequelize.query(
        `SELECT 
          o."orderId",
          o."empId",
          o."totalAmount",
          o."status",
          p."productId",
          p."productName",
          p."price",
          p."description",
          product.value->>'qty' AS "qty"
        FROM 
          "Orders" o,
          jsonb_array_elements(o."productList") AS product
        JOIN 
          "Products" p ON product.value->>'productId' = p."productId"
        WHERE 
          o."empId" = :empId;
        `,
        {
          replacements: { empId }, // Use parameterized queries to avoid SQL injection
          type: sequelize.QueryTypes.SELECT,
        }
      );

      // Log the fetched orders
      if (!orders || orders.length === 0) {
        return next(
          new AppError("No orders found for the specified employee", 404)
        );
      }
      // Transforming the fetched orders into the desired format
      const transformedData = {
        status: true, // Since you want status to be true
        orderId: orders[0].orderId, // Assuming all products belong to the same order
        totalAmount: orders[0].totalAmount,
        products: orders.map(
          ({
            empId,
            status,
            productId,
            productName,
            price,
            description,
            qty,
          }) => ({
            empId,
            status,
            productId,
            productName,
            price,
            description,
            qty,
          })
        ),
      };

      console.log("Fetched orders:", JSON.stringify(transformedData, null, 2));

      res.status(200).json({ status: true, data: transformedData });
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      next(new AppError("Internal server error", 500));
    }
  },
};

export default authController;
