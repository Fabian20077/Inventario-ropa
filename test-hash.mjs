import bcrypt from 'bcryptjs';

const password = 'password123';
const hash = await bcrypt.hash(password, 10);
console.log('Hash para password123:', hash);

// Verificar que funciona
const valida = await bcrypt.compare(password, hash);
console.log('¿Hash válido?:', valida);