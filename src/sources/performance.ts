import Source from '../source'
import {getDomainAndPathInfoFromUrl} from './../utils'
import webData from "./../web-data"
export default () => {
  return new Source('performance', (action) => {
    window.onload = function () {
      webData.getAppConfig();
      setTimeout(() => {
        let timing = null;
        const newResourceTimings = [];
        if (!window.performance) {
          return false;
        }
        timing = performance.timing;
        if (window.performance.getEntries) {
          const resourceTimings = window.performance.getEntries();
          if (resourceTimings && resourceTimings.length > 0) {
            resourceTimings.map((resourceTiming: any) => {
              if (resourceTiming.entryType === "resource" && resourceTiming.connectStart !== 0
                && resourceTiming.duration !== 0 && resourceTiming.requestStart !== 0
                && resourceTiming.domainLookupStart !== 0) {
                var cleanObject = JSON.parse(JSON.stringify(resourceTiming));
                const domainAndPath = getDomainAndPathInfoFromUrl(cleanObject.name);
                cleanObject.domain = domainAndPath.domain;
                cleanObject.path = domainAndPath.path;
                cleanObject.path1 = domainAndPath.path1;
                cleanObject.path2 = domainAndPath.path2;
                cleanObject.path3 = domainAndPath.path3;
                cleanObject.path4 = domainAndPath.path4;
                cleanObject.query = domainAndPath.query;
                newResourceTimings.push(cleanObject);
              }

            });

            action({
              category: 'performance',
              payload: {timing, resourceTimings: newResourceTimings}
            });
          }

        } else {
          action({
            category: 'performance',
            payload: {timing, resourceTimings: []}
          });
        }
      }, 1500
      );

    };

  })


}