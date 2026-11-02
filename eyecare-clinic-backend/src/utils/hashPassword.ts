import bcrypt from 'bcrypt';

const saltRounds = 10; // Adjust the number of salt rounds based on your security requirements

const hashPassword = async (plainTextPassword: string): Promise<string> => {
     try {
          const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
          return hashedPassword;
     } catch (error) {
          console.error('Error hashing password:', error);
          throw new Error('Error hashing password');
     }
};

export default hashPassword