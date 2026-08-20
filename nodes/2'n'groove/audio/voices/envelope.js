export function applyEnvelope(
    gain,
    ctx,
    attack = 0.005,
    decay = 0.2,
    peak = 1
){


    const now =
    ctx.currentTime;


    gain.gain.cancelScheduledValues(
        now
    );


    gain.gain.setValueAtTime(
        0.0001,
        now
    );


    gain.gain.linearRampToValueAtTime(
        peak,
        now + attack
    );


    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + attack + decay
    );


}