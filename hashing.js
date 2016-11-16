const bcrypt = require('bcrypt');

var hash = bcrypt.hashSync('myPlaintextPassword', 10);
console.log(hash);

console.log(bcrypt.compareSync('myPlaintextPassword', "$2a$10$xRd8Sz3NeHsD7eaa.5QuFe0S0VME2vFBTfdds1xwLAl9obDY6MA4m"));
