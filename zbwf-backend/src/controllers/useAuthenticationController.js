import User from '../models/user.model.js'; 




// export const userRegistration = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Validate the incoming data
//     if (!username || !email || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Create a new user
//     const newUser = await User.create({username, email, password });

//     // Generate tokens (if required)
//     const accessToken = newUser.generateAccessToken();
//     const refreshToken = newUser.generateRefreshToken();

//     res.status(200).json({ user: newUser, accessToken, refreshToken });
//   } catch (error) {
//     if (error.name === 'SequelizeUniqueConstraintError') {
//       return res.status(400).json({ message: 'Username or email already exists' });
//     }
//     console.error('Error registering user:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const userRegistration = async (req, res) => {
  try {
    const { username, email, password } = req.body;

   
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

  
    const newUser = await User.create({ username, email, password });

  
    const accessToken = newUser.generateAccessToken();
    const refreshToken = newUser.generateRefreshToken();

    
    const userWithoutPassword = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: error.message || 'Username or email already exists' });
    }

    console.error('Error registering user:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};



export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }


    const user = await User.findOne({ where: { email } });

   
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

 
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();


    res.status(200).json({accessToken });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

