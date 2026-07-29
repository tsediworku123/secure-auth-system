const bcrypt = require("bcrypt");

async function test() {
  const password = "MyStrongPassword123!";

  const hashedPassword = await bcrypt.hash(password, 12);

  console.log("Original password:", password);
  console.log("Hashed password:", hashedPassword);

  const isMatch = await bcrypt.compare(
    password,
    hashedPassword
  );

  console.log("Password matches:", isMatch);
}

test();