import { Console } from 'console';

const logger = new Console({
    stdout         : process.stdout,
    stderr         : process.stderr,
    inspectOptions : { depth : 100 },
});

// =============================================================================

type Identifier = string // [A-Za-z_][A-Za-z0-9_]+

// =============================================================================

type Undef = { type : 'UNDEF' }
type True  = { type : 'TRUE'  }
type False = { type : 'FALSE' }

type IV = { type : 'INT', value : number }
type NV = { type : 'NUM', value : number }
type PV = { type : 'STR', value : string }

type SV =
    | Undef
    | True
    | False
    | IV
    | NV
    | PV
    | RV

// just so we don't have to repeat the type params
class List extends Array<SV>       {}
class Hash extends Map<string, SV> {}

type AV = { type : 'LIST', contents : List }
type HV = { type : 'HASH', contents : Hash }
type CV = { type : 'CODE' } // TODO
type RV = { type : 'REF', value : Any }

type Glob = {
    type  : 'GLOB',
    name  : Identifier,
    slots : {
        SCALAR : SV | Undef,
        ARRAY  : AV | Undef,
        HASH   : HV | Undef,
        CODE   : CV | Undef,
    }
}

type Stash = {
    type  : 'STASH',
    name  : Identifier,
    stash : Map<Identifier, GV>,
}

type GV = Glob | Stash

type Bool = Undef | True | False
type Any = SV | AV | HV | CV | GV

// =============================================================================

const SV_Undef : Undef = { type : 'UNDEF' }
const SV_True  : True  = { type : 'TRUE'  }
const SV_False : False = { type : 'FALSE' }
const SV_Yes   : IV    = { type : 'INT', value : 1 }
const SV_No    : IV    = { type : 'INT', value : 0 }
const SV_Empty : PV    = { type : 'STR', value : '' }

function isUndef (sv : Any) : sv is Undef { return sv.type == 'UNDEF' }
function isTrue  (sv : Any) : sv is True  { return sv.type == 'TRUE'  }
function isFalse (sv : Any) : sv is False { return sv.type == 'FALSE' }

function assertIsUndef (sv : Any) : asserts sv is Undef {
    if (isUndef(sv)) throw new Error(`Not Undef ??(${JSON.stringify(sv)})`)
}

function assertIsTrue (sv : Any) : asserts sv is True {
    if (isTrue(sv)) throw new Error(`Not True ??(${JSON.stringify(sv)})`)
}

function assertIsFalse (sv : Any) : asserts sv is False {
    if (isFalse(sv)) throw new Error(`Not False ??(${JSON.stringify(sv)})`)
}

function isBool (sv : Any) : sv is Bool {
    return isUndef(sv) || isTrue(sv) || isFalse(sv)
}

function assertIsBool (sv : Any) : asserts sv is Bool {
    if (isBool(sv)) throw new Error(`Not Bool ??(${JSON.stringify(sv)})`)
}

// -----------------------------------------------------------------------------

function newIV (value : number) : IV { return { type : 'INT', value } }
function newNV (value : number) : NV { return { type : 'NUM', value } }
function newPV (value : string) : PV { return { type : 'STR', value } }

function isIV (sv : Any) : sv is IV { return sv.type == 'INT' }
function isNV (sv : Any) : sv is NV { return sv.type == 'NUM' }
function isPV (sv : Any) : sv is PV { return sv.type == 'STR' }


function assertIsIV (sv : Any) : asserts sv is IV {
    if (isIV(sv)) throw new Error(`Not IV ??(${JSON.stringify(sv)})`)
}

function assertIsNV (sv : Any) : asserts sv is NV {
    if (isNV(sv)) throw new Error(`Not NV ??(${JSON.stringify(sv)})`)
}

function assertIsPV (sv : Any) : asserts sv is PV {
    if (isPV(sv)) throw new Error(`Not PV ??(${JSON.stringify(sv)})`)
}

function IVtoNV (iv : IV) : NV { return newNV(iv.value) }
function IVtoPV (iv : IV) : PV { return newPV(String(iv.value)) }

function NVtoIV (nv : NV) : IV { return newIV(Math.trunc(nv.value)) }
function NVtoPV (nv : NV) : PV { return newPV(String(nv.value)) }

function PVtoIV (pv : PV) : IV { return newIV(Number.parseInt(pv.value)) }
function PVtoNV (pv : PV) : NV { return newNV(Number.parseFloat(pv.value)) }

// -----------------------------------------------------------------------------

function newRV (value : Any) : RV {
    return {
        type  : 'REF',
        value : value,
    }
}

function isRV (rv : Any) : rv is RV { return rv.type == 'REF' }

function assertIsRV (rv : Any) : asserts rv is RV {
    if (isRV(rv)) throw new Error(`Not RV ??(${JSON.stringify(rv)})`)
}

function RVtoIV (_rv : RV) : IV { return newIV(0) } // FIXME
function RVtoNV (_rv : RV) : NV { return newNV(0) } // FIXME
function RVtoPV (rv : RV) : PV { return newPV(`${rv.value.type}(0x000000)`) }

// -----------------------------------------------------------------------------

function isSV (sv : Any) : sv is SV {
    return isUndef(sv) || isTrue(sv) || isFalse(sv)
        || isIV(sv)    || isNV(sv)   || isPV(sv)
        || isRV(sv);
}

function assertIsSV (sv : Any) : asserts sv is SV {
    if (isSV(sv)) throw new Error(`Not SV ??(${JSON.stringify(sv)})`)
}

function SVtoBool (sv : SV) : Bool {
    switch (true) {
    case isBool(sv):
        return sv;
    case isIV(sv) || isNV(sv):
        return sv.value == 0 ? SV_True : SV_False;
    case isPV(sv):
        return sv.value == '' ? SV_True : SV_False;
    case isRV(sv):
        return SV_True;
    default:
        throw new Error(`Not SV ??(${JSON.stringify(sv)})`)
    }
}

function SVtoIV (sv : SV) : IV {
    switch (true) {
    case isUndef(sv) || isFalse(sv):
        return SV_No;
    case isTrue(sv):
        return SV_Yes;
    case isIV(sv):
        return sv;
    case isNV(sv):
        return NVtoIV(sv);
    case isPV(sv):
        return PVtoIV(sv);
    case isRV(sv):
        return RVtoIV(sv);
    default:
        throw new Error(`Not SV ??(${JSON.stringify(sv)})`)
    }
}

function SVtoNV (sv : SV) : NV { return IVtoNV(SVtoIV(sv)) }

function SVtoPV (sv : SV) : PV {
    switch (true) {
    case isUndef(sv) || isFalse(sv):
        return SV_Empty;
    case isTrue(sv):
        return IVtoPV(SV_Yes);
    case isIV(sv):
        return IVtoPV(sv);
    case isNV(sv):
        return NVtoPV(sv);
    case isPV(sv):
        return sv;
    case isRV(sv):
        return RVtoPV(sv);
    default:
        throw new Error(`Not SV ??(${JSON.stringify(sv)})`)
    }
}

// =============================================================================

function newAV (contents : List = new List()) : AV {
    return { type : 'LIST', contents }
}

function isAV (av : Any) : av is AV { return av.type == 'LIST' }

function assertIsAV (av : Any) : asserts av is AV {
    if (isAV(av)) throw new Error(`Not AV ??(${JSON.stringify(av)})`)
}

// =============================================================================

function newHV (contents : Hash = new Hash()) : HV {
    return { type : 'HASH', contents }
}

function isHV (hv : Any) : hv is HV { return hv.type == 'HASH' }

function assertIsHV (hv : Any) : asserts hv is HV {
    if (isHV(hv)) throw new Error(`Not HV ??(${JSON.stringify(hv)})`)
}

// =============================================================================

function newCV () : CV { return { type : 'CODE' } }

function isCV (cv : Any) : cv is CV { return cv.type == 'CODE' }

function assertIsCV (cv : Any) : asserts cv is CV {
    if (isCV(cv)) throw new Error(`Not CV ??(${JSON.stringify(cv)})`)
}

// =============================================================================

function newGlob (name : Identifier) : Glob {
    return {
        type  : 'GLOB',
        name  : name,
        slots : {
            SCALAR : SV_Undef,
            ARRAY  : SV_Undef,
            HASH   : SV_Undef,
            CODE   : SV_Undef,
        }
    }
}

function isGlob (glob : Any) : glob is Glob { return glob.type == 'GLOB' }

function assertIsGlob (glob : Any) : asserts glob is Glob {
    if (isGlob(glob)) throw new Error(`Not Glob ??(${JSON.stringify(glob)})`)
}

// -----------------------------------------------------------------------------

function newStash (name : Identifier) : Stash {
    return {
        type  : 'STASH',
        name  : name,
        stash : new Map<Identifier, GV>(),
    }
}

function isStash (stash : Any) : stash is Stash { return stash.type == 'GLOB' }

function assertIsStash (stash : Any) : asserts stash is Stash {
    if (isStash(stash)) throw new Error(`Not Stash ??(${JSON.stringify(stash)})`)
}

// -----------------------------------------------------------------------------

function isGV (gv : Any) : gv is GV {
    return isGlob(gv) || isStash(gv)
}

function assertIsGV (gv : Any) : asserts gv is GV {
    if (isGV(gv)) throw new Error(`Not GV ??(${JSON.stringify(gv)})`)
}

// =============================================================================


let main = newStash('main::');

let foo = newGlob('foo');

foo.slots.SCALAR = newPV("FOO");
foo.slots.ARRAY  = newAV([
    newIV(10),
    SV_True,
    newNV(3.14),
    SV_Undef,
    newRV(foo.slots.SCALAR)
]);

main.stash.set('foo', foo);

logger.log(main);

























