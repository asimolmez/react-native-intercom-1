var path = require("./path");
var fs = require("fs");
var { warnn, errorn, logn, infon, debugn } = require("./log");

class AppGradleLinker {

  constructor() {
    this.gradlePath = path.appRootGradle;
    this.setGoogleServicesPluginSuccess = false;
  }


  link() {
    if (!this.gradlePath) {
      errorn("App build.gradle not found! Does the file exist in the correct folder?\n   Please check the manual installation docs.");
      return;
    }

    logn("Linking app build.gradle...");

    var contents = fs.readFileSync(this.gradlePath, "utf8");

    try {
      contents = this.setPluginDependency(contents);
      this.setGoogleServicesPluginSuccess = true;
    } catch (e) {
      errorn("   " + e);
    }

    fs.writeFileSync(this.gradlePath, contents);

    if (this.setGoogleServicesPluginSuccess) {
      infon("Root build.gradle linked successfully!\n");
    }

  }

  setPluginDependency(contents) {
    if (this._isGoogleServicesPluginDeclared(contents)) {
      warnn("Google services plugin already declared");
      return contents;
    }

    var match = /apply plugin: "com.android.application"/.exec(contents);
    if (match) {
      debugn("Adding Google Services plugin");
      return this.insertString(contents, match.index, `apply plugin: 'com.google.gms.google-services'\n`);
    } else {
      throw new Error("   Could not add Google Services plugin dependency");
    }
  }

  _isGoogleServicesPluginDeclared(contents) {
    return /com.google.gms.google-services/.test(contents);
  }

  insertString(to, fromIndex, what) {
    return to.substring(0, fromIndex) + what + to.substring(fromIndex, to.length);
  }

}

module.exports = AppGradleLinker;
