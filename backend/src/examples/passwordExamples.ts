/**
 * Ejemplo de uso en controladores
 */

// ✅ CORRECTO: Registrar usuario
// async function registerUser(req, res) {
//   try {
//     const { username, name, email, password, birthdate } = req.body;

//     const user = await UserService.createUser({
//       username,
//       name,
//       email,
//       password, // ← Contraseña en texto plano
//       birthdate: new Date(birthdate)
//     });

//     res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       user // ← No incluye la contraseña hasheada
//     });

//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// }

// ✅ CORRECTO: Login usuario
// async function loginUser(req, res) {
//   try {
//     const { email, password } = req.body;

//     const user = await UserService.authenticateUser(email, password);

//     // Aquí generarías el JWT token
//     const token = generateJWT(user.id);

//     res.json({
//       success: true,
//       message: 'Login successful',
//       user,
//       token
//     });

//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: 'Invalid credentials'
//     });
//   }
// }
