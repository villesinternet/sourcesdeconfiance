var _ = require('lodash');

export default class Config {
  /**
   * Constructs a new instance.
   *
   * @param      Object  config  The configuration.
   *                             If undefined, reads data from defaults & local storage
   */
  constructor(config) {
    console.log('>Config:constructor');

    if (config) {
      this.config = config;
      return;
    }
    this.config = defaults;

    // browser.storage.local.get()
    //    .then(
    //      function(conf) {

    //        if (conf) _.merge(this.config, conf);

    //        this.storeConfig();

    //      }.bind(this),

    //        function(e) {
    //          console.error(`Error fetching config: ${e}`);
    //      }
    //    );
  }

  /**
   * Store the config in local storage
   */
  // storeConfig() {

  // 	browser.storage.local.set(this.config)
  // 	.then(
  // 		() => console.log("config saved"),
  // 		(err) => console.log("error storing config:" + err)
  // 	);
  // }

  /**
   * get a value using a dot notation path
   *
   * @path       String 	Path to the item
   * @defaultvalue any 	default value if the path is undefined
   *
   *
   */
  get(path, defaultValue) {
    return _.get(this.config, path, defaultValue);
  }

  /**
   * sets a value using a dot notation path
   *
   *
   * @return     objevt the object updated with value
   */
  set(path, value) {
    var obj = _.set(this.config, path, value);
    //this.storeConfig();

    return obj;
  }
}
