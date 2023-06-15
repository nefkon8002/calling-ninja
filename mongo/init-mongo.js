print('START 0 #################################################################');

db.createUser({
  user: "schedulerTask",
  pwd: "password",
  roles: [{ role: "readWrite", db: "callingninja" }]
  // roles: [{ role: "readWrite", db: "tpv" }]
  // roles: [{ role: "readWrite", db: "document-tasks" }]
});
print('START 1 #################################################################');
// db.createCollection("task-execution");
// db.createCollection("tpv");
db.createCollection("callingninja");

print('END  #################################################################');