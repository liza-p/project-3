const db = require("../models");

module.exports = {

  getInfo(req, res) {
    if (!req.user) {
      return res.status(401).end();
    }

    // for getting household data (name, invite_code, members)
    db.Household.findOne({ 
      where: { id: req.user.HouseholdId },
      include: db.User,
    })
      .then((household) => {
        // console.log(household);
        return res.json({
          name: household.name,
          invite_code: household.invite_code,
          members: household.Users.map(user => ({ id: user.id, name: user.name }))
        });
      })
      .catch(function (err) {
        console.log(err);
        res.status(500).end();
      });
  },

  findMembers(req, res) {
    // console.log(req.query);
    db.User.findAll({ where: { HouseholdId: req.user.HouseholdId } })
      .then(data => res.json(
        data.map((row) => ({
          id: row.dataValues.id,
          name: row.dataValues.name
        }))
      ))
      .catch(function (err) {
        console.log(err);
        res.status(500).end();
      });
  },

  getInviteCode(req, res) {
    db.Household.findOne({ where: { id: req.query.id } })
      .then((data) => res.json(data.invite_code))
      .catch(function (err) {
        console.log(err);
        res.status(500).end();
      });
  },

  joinHousehold(req, res) {
    console.log("Invite code", req.query.invite)
    console.log("User ID", req.query.userId);
    db.Household.findOne({ where: { invite_code: req.query.invite } })
      .then(function (household) {
        if (!household) {
          console.log("Incorect Invite Code")
          res.status(401).end();
        }
        return db.User.update({
          HouseholdId: household.id,
        }, {
          where: { id: req.query.userId }
        })
      })
      .then((user) => { res.status(200).end(); })
      .catch(function (err) {
        console.log(err);
        res.status(500).end();
      });
  }
}
