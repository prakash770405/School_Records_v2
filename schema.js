const Joi = require("joi");

module.exports.stdschema = Joi.object({
    name: Joi.string()
  .trim()
  .pattern(/^[A-Za-z\s]+$/)
  .required()
  .messages({
    "string.pattern.base": "Name must contain only alphabets"
  }),

    img: Joi.object({
        url: Joi.string().uri().allow("", null),
        filename: Joi.string().allow("", null),
        photosize: Joi.number().allow(null),
        phototype: Joi.string().allow("", null),
    }).allow(null),

    subjects: Joi.array().items(
        Joi.object({
            name: Joi.string().trim().required(),
            marks: Joi.number().min(0).max(100).required(),
        })
    ).default([]),

    age: Joi.number()
        .min(4)
        .max(100)
        .required(),

    roll_no: Joi.number()
        .required(),

    phone_no: Joi.number()
        .required(),

    email: Joi.string()
        .email()
        .required(),

    Class: Joi.number()
        .required(),

    date: Joi.date().optional()
});
