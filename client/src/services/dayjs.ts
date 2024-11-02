import myDayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

myDayjs.extend(advancedFormat);
myDayjs.extend(utc);
myDayjs.extend(timezone);

export default myDayjs;
