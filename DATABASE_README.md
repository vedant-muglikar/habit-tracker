CREATE TABLE habit_category (
id INT PRIMARY KEY AUTO_INCREMENT,
type VARCHAR(50) NOT NULL,
polarity VARCHAR(20) NOT NULL
);

CREATE TABLE habits (
id INT PRIMARY KEY AUTO_INCREMENT,
habit_name VARCHAR(100) NOT NULL,
cat_hab_id INT NOT NULL,
is_active BOOLEAN DEFAULT TRUE,
FOREIGN KEY (cat_hab_id) REFERENCES habit_category(id)
);

CREATE TABLE habit_description (
id INT PRIMARY KEY AUTO_INCREMENT,
habit_id INT NOT NULL,
description TEXT,
FOREIGN KEY (habit_id) REFERENCES habits(id)
);

CREATE TABLE performance (
id INT PRIMARY KEY AUTO_INCREMENT,
habit_id INT NOT NULL,
start_date DATE NOT NULL,
end_date DATE,
streak INT DEFAULT 0,
last_checked_in DATE,
FOREIGN KEY (habit_id) REFERENCES habits(id)
);

CREATE TABLE check_in (
id INT PRIMARY KEY AUTO_INCREMENT,
habit_id INT NOT NULL,
followed BOOLEAN NOT NULL,
FOREIGN KEY (habit_id) REFERENCES habits(id)
);

# Design equivalent collections for the mini project problem statement.

use habit_tracker

db.createCollection("habits")
db.createCollection("check_ins")

db.habits.insertOne({
habit_name: "Drink Water",
is_active: true,
category: {
type: "Health",
polarity: "Positive"
},
description: "Drink 8 glasses daily",
performance: {
streak: 5,
start_date: new Date("2026-04-01"),
last_checked_in: new Date("2026-04-15")
}
})

db.check_ins.insertOne({
habit_id: 1,
followed: true,
date: new Date()
})

db.habits.insertMany([
{
habit_name: "Exercise",
is_active: true,
category: { type: "Health", polarity: "Positive" },
description: "Workout for at least 30 minutes",
performance: {
streak: 10,
start_date: new Date("2026-03-20"),
last_checked_in: new Date("2026-04-14")
}
},
{
habit_name: "Smoking",
is_active: true,
category: { type: "Health", polarity: "Negative" },
description: "Avoid smoking cigarettes",
performance: {
streak: 3,
start_date: new Date("2026-04-01"),
last_checked_in: new Date("2026-04-13")
}
},
{
habit_name: "Reading",
is_active: true,
category: { type: "Productivity", polarity: "Positive" },
description: "Read 20 pages daily",
performance: {
streak: 7,
start_date: new Date("2026-04-05"),
last_checked_in: new Date("2026-04-15")
}
},
{
habit_name: "Junk Food",
is_active: false,
category: { type: "Health", polarity: "Negative" },
description: "Avoid eating junk food",
performance: {
streak: 15,
start_date: new Date("2026-03-01"),
last_checked_in: new Date("2026-04-10")
}
},
{
habit_name: "Meditation",
is_active: true,
category: { type: "Mental Health", polarity: "Positive" },
description: "Meditate for 10 minutes",
performance: {
streak: 12,
start_date: new Date("2026-03-25"),
last_checked_in: new Date("2026-04-15")
}
}
])

db.check_ins.insertMany([
{ habit_id: ObjectId("69dfc6ab760839f0c23682d1"), followed: true, date: new Date("2026-04-10") },
{ habit_id: ObjectId("69dfc6ab760839f0c23682d1"), followed: true, date: new Date("2026-04-11") },
{ habit_id: ObjectId("69dfc6ab760839f0c23682d1"), followed: false, date: new Date("2026-04-12") },

{ habit_id: ObjectId("69dfc77d760839f0c23682d3"), followed: true, date: new Date("2026-04-13") },
{ habit_id: ObjectId("69dfc77d760839f0c23682d3"), followed: false, date: new Date("2026-04-14") },

{ habit_id: ObjectId("69dfc77d760839f0c23682d4"), followed: true, date: new Date("2026-04-15") },
{ habit_id: ObjectId("69dfc77d760839f0c23682d4"), followed: true, date: new Date("2026-04-14") },

{ habit_id: ObjectId("69dfc77d760839f0c23682d5"), followed: false, date: new Date("2026-04-10") },

{ habit_id: ObjectId("69dfc77d760839f0c23682d6"), followed: true, date: new Date("2026-04-15") }
])

# Write at least 10 MongoDB queries covering CRUD operations, aggregation, indexing, and search features.

db.habits.insertOne({
habit_name: "Drink Water",
is_active: true,
category: {
type: "Health",
polarity: "Positive"
},
description: "Drink 8 glasses daily",
performance: {
streak: 5,
start_date: new Date("2026-04-01"),
last_checked_in: new Date("2026-04-15")
}
})

db.check_ins.insertMany([
{ habit_id: ObjectId("69dfc6ab760839f0c23682d1"), followed: true, date: new Date("2026-04-10") },
{ habit_id: ObjectId("69dfc6ab760839f0c23682d1"), followed: true, date: new Date("2026-04-11") },
{ habit_id: ObjectId("69dfc6ab760839f0c23682d1"), followed: false, date: new Date("2026-04-12") },

{ habit_id: ObjectId("69dfc77d760839f0c23682d3"), followed: true, date: new Date("2026-04-13") },
{ habit_id: ObjectId("69dfc77d760839f0c23682d3"), followed: false, date: new Date("2026-04-14") },

{ habit_id: ObjectId("69dfc77d760839f0c23682d4"), followed: true, date: new Date("2026-04-15") },
{ habit_id: ObjectId("69dfc77d760839f0c23682d4"), followed: true, date: new Date("2026-04-14") },

{ habit_id: ObjectId("69dfc77d760839f0c23682d5"), followed: false, date: new Date("2026-04-10") },

{ habit_id: ObjectId("69dfc77d760839f0c23682d6"), followed: true, date: new Date("2026-04-15") }
])

db.habits.find()

db.habits.find({ is_active: false })

db.habits.updateOne(
{ habit_name: "Exercise" },
{ $set: { is_active: false } }
)

db.habits.updateMany(
{ "category.type": "Health" },
{ $inc: { "performance.streak": 1 } }
)

db.habits.deleteOne({ habit_name: "Reading" })

db.check_ins.aggregate([
{
$group: {
_id: "$habit_id",
total_checkins: { $sum: 1 }
}
}
])

db.habits.createIndex({ habit_name: 1 })

habit_tracker> db.habits.find({habit_name: /meditation/i})

db.habits.find().sort({ "performance.streak": -1 }).limit(3)
