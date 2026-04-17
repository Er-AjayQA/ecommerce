const slugify = require("slugify");

const generateCode = async (model, value, field = "code") => {
  let base = slugify(value, { lower: true, strict: true });
  let code = base;
  let count = 1;

  while (true) {
    const exist = await model.findOne({ where: { [field]: code } });
    if (!exist) break;

    code = `${base}-${count}`;
    count++;
  }

  return code;
};

module.exports = generateCode;