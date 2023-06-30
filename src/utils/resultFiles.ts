const files: string[] = [];

const resultFiles = {
  addFile: (file: string) => {
    files.push(file);
  },

  getAll: () => {
    return files;
  },
};

module.exports = resultFiles;
