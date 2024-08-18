import winston, { format, transports } from "winston";
const { combine, timestamp, prettyPrint } = format;

const logger = winston.createLogger({
  format: combine(timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }), prettyPrint()),
  transports: [new transports.Console()],

  // Logging into file
  //   transports: [
  //     new transports.File({
  //       filename: "logs/example.log",
  //     }),
  //   ],
});
export default logger;
