const fs = require("fs");
const path = require("path");

// Path to watch
const folderPath = path.join(__dirname, "build/chrome-mv3-dev");

// Map to track last modification times
const processedFiles = new Map();

// Watch the directory for changes
fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith(".js")) {
    const filePath = path.join(folderPath, filename);
    // if(eventType === 'rename'){
    //     return;
    // }

    // console.log(`File ${eventType}: ${filePath}`);

    // Check the last modification time
    fs.stat(filePath, (err, stats) => {
      if (err) {
        // console.error("Error getting file stats:", err);
        return;
      }

      const lastModifiedTime = parseInt(stats.mtimeMs/1000);

    //   console.log(processedFiles.get(filePath), lastModifiedTime);

    console.log(processedFiles.get(filePath), lastModifiedTime, processedFiles.get(filePath) === lastModifiedTime, filePath)
      // Skip the file if it's already processed
      if (processedFiles.get(filePath) === lastModifiedTime) {
        processedFiles.set(filePath, lastModifiedTime);
        // console.log(`Skipping already processed file: ${filePath}`);
        return;
      }

      // Read and replace content
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }

        const updatedData = data.replace(/t\[t\?\.(length - 1)\]/g, 't[t?.length - 1]?.replace(";", "")');

        fs.writeFile(filePath, updatedData, (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            // console.log("Updated file:", filePath);
          }
        });
      });

      // Update the map with the new modification time
      processedFiles.set(filePath, lastModifiedTime);
    });
  }
});
