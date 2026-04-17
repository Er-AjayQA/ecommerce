
# 1. Create the database
npx sequelize-cli db:create
 
#Create a Sequelize migration file
 
npx sequelize-cli migration:generate --name create-users-table
 
# 2. Run all migrations to create tables
npx sequelize-cli db:migrate

addon key table
npx sequelize-cli migration:create --name update-create-user
 
# 3. Undo all migrations
npx sequelize-cli db:migrate:undo:all
 

for generate model and migration
npx sequelize-cli model:generate --name OrgBrands --attributes name:string --models-path src/modules/OrgBrands/models

 
# 1. Seeders create cmd
npx sequelize-cli seed:generate --name superadmin-user
 
# 2. Seeders run cmd
npx sequelize-cli db:seed:all


http://localhost:15672/  #rabbitmq
user.- guest ,  pass.- guest







for generate model and migration
npx sequelize-cli model:generate --name Users --attributes name:string,email:string,password:string --models-path src/modules/Users/models --migrations-path src/migrations/zyno_ecom_template
npx sequelize-cli model:generate --name Category --attributes name:string,email:string,password:string --models-path src/modules/masters/Master/models --migrations-path src/migrations/zyno_ecom_template





Seeders run cmd zyno_pos
npx sequelize-cli db:seed --seed 20251117094131-category.js --options-path template.sequelizerc
