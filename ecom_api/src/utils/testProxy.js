const { Sequelize, DataTypes } = require("sequelize");
const { AsyncLocalStorage } = require("async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();

(async () => {
    // 1. Create main sequelize (simulating main database)
    const mainSeq = new Sequelize("sqlite::memory:");
    
    // 2. Define a model on the main sequelize
    const User = mainSeq.define("User", {
        name: DataTypes.STRING
    });
    await User.sync();
    await User.create({ name: "Main DB User" });

    // 3. Create tenant sequelize (simulating tenant database)
    const tenantSeq = new Sequelize("sqlite::memory:");
    tenantSeq.models.User = User; // This is what happens natively if we use query proxying
    // Actually we don't even need to assign models if we proxy query because Sequelize delegates all standard dialect queries to `this.query()`

    const tenantUserDef = tenantSeq.define("User", {
        name: DataTypes.STRING
    });
    await tenantUserDef.sync();
    await tenantUserDef.create({ name: "Tenant DB User" });

    // 4. Proxy mainSeq
    const originalQuery = mainSeq.query.bind(mainSeq);
    mainSeq.query = async function(...args) {
        const store = asyncLocalStorage.getStore();
        if (store && store.tenantDB) {
            console.log("-> Intercepted, querying tenantDB");
            return store.tenantDB.query(...args);
        }
        console.log("-> No store, querying mainSeq");
        return originalQuery(...args);
    };

    const originalTransaction = mainSeq.transaction.bind(mainSeq);
    mainSeq.transaction = async function(...args) {
        const store = asyncLocalStorage.getStore();
        if (store && store.tenantDB) {
            return store.tenantDB.transaction(...args);
        }
        return originalTransaction(...args);
    };

    // 5. Test concurrent fetch using Main Models
    await asyncLocalStorage.run({ tenantDB: tenantSeq }, async () => {
        const users = await User.findAll();
        console.log("In ALS context expected Tenant users:", users.map(u => u.name));
    });

    const mainUsers = await User.findAll();
    console.log("Outside ALS context expected Main users:", mainUsers.map(u => u.name));

})();
