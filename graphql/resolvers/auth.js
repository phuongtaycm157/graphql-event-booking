const bcrypt = require('bcrypt');

const User = require('../../models/user');

module.exports = {
  createUser: async args => {
    try {
      const userAlready = await User.findOne({
        email: args.userInput.email
      });
      if (userAlready) {
        throw new Error('User exits already!')
      }

      const hashPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashPassword
      });

      const result = await user.save();
      return {
        ...result._doc,
        password: null,
        _id: result.id,
      };
    } catch (err) {
      throw err;
    }
  }
}