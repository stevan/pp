// =============================================================================

export type Identifier = string // [A-Za-z_][A-Za-z0-9_]+

// =============================================================================

export type Undef = { type : 'UNDEF' }
export type True  = { type : 'TRUE'  }
export type False = { type : 'FALSE' }

export type IV = { type : 'INT', value : number }
export type NV = { type : 'NUM', value : number }
export type PV = { type : 'STR', value : string }

export type SV =
    | Undef
    | True
    | False
    | IV
    | NV
    | PV
    | RV

// just so we don't have to repeat the type params
export class List extends Array<SV>       {}
export class Hash extends Map<string, SV> {}

export type AV = { type : 'LIST', contents : List }
export type HV = { type : 'HASH', contents : Hash }
export type CV = { type : 'CODE' } // TODO
export type RV = { type : 'REF', value : Any }

export type Glob = {
    type  : 'GLOB',
    name  : Identifier,
    slots : {
        SCALAR : SV | Undef,
        ARRAY  : AV | Undef,
        HASH   : HV | Undef,
        CODE   : CV | Undef,
    }
}

export type Stash = {
    type  : 'STASH',
    name  : Identifier,
    stash : Map<Identifier, GV>,
}

export type GV = Glob | Stash

export type Bool = Undef | True | False
export type Any = SV | AV | HV | CV | GV

// =============================================================================

export const SV_Undef : Undef = { type : 'UNDEF' }
export const SV_True  : True  = { type : 'TRUE'  }
export const SV_False : False = { type : 'FALSE' }
export const SV_Yes   : IV    = { type : 'INT', value : 1 }
export const SV_No    : IV    = { type : 'INT', value : 0 }
export const SV_Empty : PV    = { type : 'STR', value : '' }

export function isUndef (sv : Any) : sv is Undef { return sv.type == 'UNDEF' }
export function isTrue  (sv : Any) : sv is True  { return sv.type == 'TRUE'  }
export function isFalse (sv : Any) : sv is False { return sv.type == 'FALSE' }

export function assertIsUndef (sv : Any) : asserts sv is Undef {
    if (isUndef(sv)) throw new Error(`Not Undef ??(${JSON.stringify(sv)})`)
}

export function assertIsTrue (sv : Any) : asserts sv is True {
    if (isTrue(sv)) throw new Error(`Not True ??(${JSON.stringify(sv)})`)
}

export function assertIsFalse (sv : Any) : asserts sv is False {
    if (isFalse(sv)) throw new Error(`Not False ??(${JSON.stringify(sv)})`)
}

export function isBool (sv : Any) : sv is Bool {
    return isUndef(sv) || isTrue(sv) || isFalse(sv)
}

export function assertIsBool (sv : Any) : asserts sv is Bool {
    if (isBool(sv)) throw new Error(`Not Bool ??(${JSON.stringify(sv)})`)
}

// -----------------------------------------------------------------------------

export function newIV (value : number) : IV { return { type : 'INT', value } }
export function newNV (value : number) : NV { return { type : 'NUM', value } }
export function newPV (value : string) : PV { return { type : 'STR', value } }

export function isIV (sv : Any) : sv is IV { return sv.type == 'INT' }
export function isNV (sv : Any) : sv is NV { return sv.type == 'NUM' }
export function isPV (sv : Any) : sv is PV { return sv.type == 'STR' }


export function assertIsIV (sv : Any) : asserts sv is IV {
    if (!isIV(sv)) throw new Error(`Not IV ??(${JSON.stringify(sv)})`)
}

export function assertIsNV (sv : Any) : asserts sv is NV {
    if (!isNV(sv)) throw new Error(`Not NV ??(${JSON.stringify(sv)})`)
}

export function assertIsPV (sv : Any) : asserts sv is PV {
    if (!isPV(sv)) throw new Error(`Not PV ??(${JSON.stringify(sv)})`)
}

export function IVtoNV (iv : IV) : NV { return newNV(iv.value) }
export function IVtoPV (iv : IV) : PV { return newPV(String(iv.value)) }

export function NVtoIV (nv : NV) : IV { return newIV(Math.trunc(nv.value)) }
export function NVtoPV (nv : NV) : PV { return newPV(String(nv.value)) }

export function PVtoIV (pv : PV) : IV { return newIV(Number.parseInt(pv.value)) }
export function PVtoNV (pv : PV) : NV { return newNV(Number.parseFloat(pv.value)) }

// -----------------------------------------------------------------------------

export function newRV (value : Any) : RV {
    return {
        type  : 'REF',
        value : value,
    }
}

export function isRV (rv : Any) : rv is RV { return rv.type == 'REF' }

export function assertIsRV (rv : Any) : asserts rv is RV {
    if (!isRV(rv)) throw new Error(`Not RV ??(${JSON.stringify(rv)})`)
}

export function RVtoIV (rv : RV) : IV { return newIV(0) } // FIXME
export function RVtoNV (rv : RV) : NV { return newNV(0) } // FIXME
export function RVtoPV (rv : RV) : PV { return newPV(`${rv.value.type}(0x000000)`) }

// -----------------------------------------------------------------------------

export function isSV (sv : Any) : sv is SV {
    return isUndef(sv) || isTrue(sv) || isFalse(sv)
        || isIV(sv)    || isNV(sv)   || isPV(sv)
        || isRV(sv);
}

export function assertIsSV (sv : Any) : asserts sv is SV {
    if (!isSV(sv)) throw new Error(`Not SV ??(${JSON.stringify(sv)})`)
}

export function SVtoBool (sv : SV) : Bool {
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

export function SVtoIV (sv : SV) : IV {
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

export function SVtoNV (sv : SV) : NV { return IVtoNV(SVtoIV(sv)) }

export function SVtoPV (sv : SV) : PV {
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

export function newAV (contents : List = new List()) : AV {
    return { type : 'LIST', contents }
}

export function isAV (av : Any) : av is AV { return av.type == 'LIST' }

export function assertIsAV (av : Any) : asserts av is AV {
    if (!isAV(av)) throw new Error(`Not AV ??(${JSON.stringify(av)})`)
}

// =============================================================================

export function newHV (contents : Hash = new Hash()) : HV {
    return { type : 'HASH', contents }
}

export function isHV (hv : Any) : hv is HV { return hv.type == 'HASH' }

export function assertIsHV (hv : Any) : asserts hv is HV {
    if (!isHV(hv)) throw new Error(`Not HV ??(${JSON.stringify(hv)})`)
}

// =============================================================================

export function newCV () : CV { return { type : 'CODE' } }

export function isCV (cv : Any) : cv is CV { return cv.type == 'CODE' }

export function assertIsCV (cv : Any) : asserts cv is CV {
    if (!isCV(cv)) throw new Error(`Not CV ??(${JSON.stringify(cv)})`)
}

// =============================================================================

export function newGlob (name : Identifier) : Glob {
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

export function isGlob (glob : Any) : glob is Glob { return glob.type == 'GLOB' }

export function assertIsGlob (glob : Any) : asserts glob is Glob {
    if (!isGlob(glob)) throw new Error(`Not Glob ??(${JSON.stringify(glob)})`)
}

// -----------------------------------------------------------------------------

export function newStash (name : Identifier) : Stash {
    return {
        type  : 'STASH',
        name  : name,
        stash : new Map<Identifier, GV>(),
    }
}

export function isStash (stash : Any) : stash is Stash { return stash.type == 'GLOB' }

export function assertIsStash (stash : Any) : asserts stash is Stash {
    if (!isStash(stash)) throw new Error(`Not Stash ??(${JSON.stringify(stash)})`)
}

// -----------------------------------------------------------------------------

export function isGV (gv : Any) : gv is GV {
    return isGlob(gv) || isStash(gv)
}

export function assertIsGV (gv : Any) : asserts gv is GV {
    if (!isGV(gv)) throw new Error(`Not GV ??(${JSON.stringify(gv)})`)
}

// =============================================================================

