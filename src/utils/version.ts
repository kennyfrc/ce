// Basic version information
interface VersionInfo {
  version: string;
  host: string;
  license: string;
  print(): string[][];
}

const versionInfo: VersionInfo = {
  version: "5.0.0",
  host: "https://bossanova.uk/jspreadsheet",
  license: "MIT",
  print: function () {
    return [["Jspreadsheet CE", this.version, this.host, this.license]];
  },
};

export default versionInfo;
