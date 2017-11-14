import Source from '../source'

export default () => {
    return new Source('performance', (action) => {
        window.onload = function() {
            const resourceTiming =  window.performance.getEntries();
            action({
                category: 'performance',
                payload:  {resourceTiming}
            });
        };


    })


}