import { Product } from "./../../../models/products";
import { authMiddlewareCors } from "lib/init-middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { authMiddleware } from "lib/middlewares";
import {
  deleteProduct,
  getProduct,
  setOrUpdateProduct,
} from "controller/products";
import * as yup from "yup";

let querySchema = yup
  .object()
  .shape({
    productId: yup.string().required(),
  })
  .noUnknown(true)
  .strict();

async function getHandler(req: NextApiRequest, res: NextApiResponse, userBody) {
  try {
    await querySchema.validate(req.query);
    const productId = req.query.productId;
    const resultado = await getProduct(productId);
    if (resultado == false)
      return res.status(404).send({ message: "Product not found" });
    res.send(resultado);
  } catch (error) {
    res.status(404).send(error);
  }
}

async function patchHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  userBody
) {
  try {
    await querySchema.validate(req.query);
    await setOrUpdateProduct(req.body, userBody.userId);
  } catch (error) {
    res.status(404).send(error);
  }

  res.send(true);
}

async function deleteHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  userBody
) {
  try {
    await querySchema.validate(req.query);
    await deleteProduct(req.query.productId);
    res.send(true);
  } catch (error) {
    res.status(404).send(error);
  }
}

const handler = methods({
  get: getHandler,
  patch: authMiddleware(patchHandler),
  delete: authMiddleware(deleteHandler),
});

export default authMiddlewareCors(handler);
