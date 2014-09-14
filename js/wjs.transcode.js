(function (wjs) {
  'use strict';
  // <--]
  /**
   * Class transcode are used as base
   * constructor to allow object to be
   * converted into other languages,
   * basically from PHP to Javascript.
   * It also manage several paths to define
   * client / server roots and other custom
   * locations. This way, it maintain stability
   * of the same program between different environments.
   */
  wjs.constructors['wjs\\transcode'] = function () {

  };

  wjs.constructors['wjs\\transcode'].prototype = {
    // List of required paths by constructor.
    paths_required: [],
    transcode_class_name: undefined,
    // Store data able to be converted in this variable.
    transcoded_data: {
      server: {
        paths: {
          root: ''
        }
      },
      client: {
        paths: {
          root: ''
        }
      }
    },
    w: null,

    /**
     * Construct object with predefined paths,
     * paths_required allow to specify which path
     * is expected on construction.
     * @param {object} paths
     */
    __construct: function (transcode_id, paths) {
      // If no transcode id, maybe we have only one instance
      // for this object, so we use name as an id.
      transcode_id = (transcode_id !== undefined) ? transcode_id : this.transcode_class_name;
      this.transcoded_data = this.w.extend(true, {}, this.transcoded_data);
      // Search for saved data.
      if (this.w.transcoded_data.hasOwnProperty(this.transcode_class_name) && this.w.transcoded_data[this.transcode_class_name].hasOwnProperty(transcode_id)) {
        // Add transcoded data.
        this.w.extend(true, this.transcoded_data, this.w.transcoded_data[this.transcode_class_name][transcode_id]);
      }
      // Add paths.
      if (paths !== undefined) {
        var side, i;
        // Search for unfilled paths.
        for (side in this.paths_required) {
          if (this.paths_required.hasOwnProperty(side)) {
            if (paths.hasOwnProperty(side)) {
              this.w.error('Missing paths side : ' + side);
            }
            else {
              for (i in this.paths_required[side]) {
                if (this.paths_required[side].hasOwnProperty(i) && !paths.hasOwnProperty(i)) {
                  this.w.error('Missing constructor paths arguments : ' + side + ' > ' + i);
                }
              }
            }
          }
        }
        // Use common method to save multiple paths.
        this.paths(paths);
      }
    },

    /**
     * Set / Get a variable into the exportable
     * data for other languages.
     * @param {string} side
     * @param {string} name
     * @param {*=} [value]
     * @return mixed
     */
    transcoded_variable: function (side, name, value) {
      if (value !== undefined) {
        this.transcoded_data[side][name] = value;
      }
      // We not support to access to undefined side.
      if (!this.transcoded_data.hasOwnProperty(side)) {
        this.w.error('Trying to access to undefined transcoded data side : ' + side);
        return false;
      }
      return this.transcoded_data[side].hasOwnProperty(name) ? this.transcoded_data[side][name] : false;
    },

    /**
     * Return value of a path without
     * prepend value of root path.
     * @param {string} side
     * @param {string} name
     * @returns string
     */
    path_raw: function (side, name) {
      var paths = this.transcoded_variable(side, 'paths');
      return paths.hasOwnProperty(name) ? paths[name] : false;
    },

    /**
     * Set value of a path.
     * Return value of a path with root path prepended.
     * @param {string} side
     * @param {string} name
     * @param {string=} [value]
     * @returns {*}
     */
    path: function (side, name, value) {
      // Save as a transcoded variable.
      var paths = this.transcoded_variable(side, 'paths'),
        path_raw;
      if (value !== undefined) {
        paths[name] = value;
        this.transcoded_variable(side, 'paths', paths);
      }
      // Return requested path if exists.
      path_raw = this.path_raw(side, name);
      if (path_raw !== false) {
        // Append root path.
        return (name !== 'root' ? paths.root : '') + this.path_raw(side, name);
      }
      return false;
    },

    /**
     * Save multiple paths in one time.
     * @param {string|object} side
     * @param {object=} [paths]
     * @returns {*}
     */
    paths: function (side, paths) {
      var name, output = [], paths_saved;
      if (side instanceof Array) {
        for (name in paths) {
          if (paths.hasOwnProperty(name)) {
            this.paths(name, paths);
          }
        }
        return null;
      }
      // Set paths.
      if (paths !== undefined) {
        for (name in paths) {
          if (paths.hasOwnProperty(name)) {
            this.path(side, name, paths[name]);
          }
        }
      }
      // Get paths.
      else {
        paths_saved = this.transcoded_variable(side, 'paths');
        for (name in paths_saved) {
          if (paths_saved.hasOwnProperty(name) && paths.hasOwnProperty(name)) {
            output[name] = this.path(side, name);
          }
        }
        return output;
      }
    },

    /**
     * Convert exportable data into expected format.
     * Use internal named function for specific conversions.
     * @returns {*}
     */
    convert: function () {
      var format = arguments.shift(),
        method = 'convert_to_' + format;
      if (this.hasOwnProperty(method)) {
        return this[method].apply(this, arguments);
      }
      // Errors are not allowed.
      this.w.error('Trying to export unsupported format ' + format);
    },

    /**
     * Return data as an array.
     * This may be used to convert data by
     * others scripts.
     * @returns {*}
     */
    convert_to_array: function () {
      return this.transcoded_data;
    }
  };
  // [-->
}(wjs));