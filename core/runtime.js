export function startEntity(entity) {

    console.log("Entity state: START");

    if (entity.start) {
        entity.start();
    }

}


export function stopEntity(entity) {

    console.log("Entity state: STOP");

    if (entity.stop) {
        entity.stop();
    }

}