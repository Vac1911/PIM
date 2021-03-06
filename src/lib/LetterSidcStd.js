import { app6b } from "./stanag-app6-master";

export const affiliations = {
    P: { index: 0, name: "Pending", sidc: "SPGP" },
    U: { index: 1, name: "Unknown", sidc: "SUGP" },
    A: { index: 2, name: "Assumed Friend", sidc: "SAGP" },
    F: { index: 3, name: "Friend", sidc: "SFGP" },
    N: { index: 4, name: "Neutral", sidc: "SNGP" },
    S: { index: 5, name: "Suspect", sidc: "SSGP" },
    H: { index: 6, name: "Hostile", sidc: "SHGP" },
    G: { index: 7, name: "Exercise Pending", sidc: "SGGP" },
    W: { index: 8, name: "Exercise Unknown", sidc: "SWGP" },
    D: { index: 9, name: "Exercise Friend", sidc: "SDGP" },
    L: { index: 10, name: "Exercise Neutral", sidc: "SLGP" },
    M: { index: 11, name: "Exercise Assumed Friend", sidc: "SMGP" },
    J: { index: 12, name: "Joker", sidc: "SJGP" },
    K: { index: 13, name: "Faker", sidc: "SKGP" },
    O: { index: 14, name: "None Specified", sidc: "SOGP" }
};

export const dimensions = Object.fromEntries(Object.entries(app6b.WAR).slice(1));

export const statuses = {
    A: { index: 0, name: "Anticipated/Planned", sidc: "SFGA" },
    P: { index: 1, name: "Present", sidc: "SFGP" },
    C: { index: 2, name: "Present/Fully Capable", sidc: "SFGC" },
    D: { index: 3, name: "Present/Damaged", sidc: "SFGD" },
    X: { index: 4, name: "Present/Destroyed", sidc: "SFGX" },
    F: { index: 5, name: "Present/Full To Capacity", sidc: "SFGF" }
};

export function roles(scheme="WAR", dimension='') {
    if(app6b[scheme][dimension])
        return app6b[scheme][dimension].mainIcon;
    else
        return { "-": { name: "-" } };
}

export function rolesGrouped (scheme="WAR", dimension='', ...filters) {
    let criteria = '------'.split('');
    for(let [slot, letter] of filters)
        criteria[slot] = letter;
    criteria = criteria.join('');
    const current_slot = criteria.indexOf('-'),
        role_arr = roles(scheme, dimension).filter((r) => r.functionid.startsWith(criteria.substring(1, current_slot), 1)),
        current_array = role_arr.map((role) => [role.functionid.charAt(current_slot), role.names[current_slot + 3]]);
    return _.uniqBy(current_array, '[0]');
}

export function modifier1(battledimension = '') {
    if (battledimension == "GRDTRK_UNT") {
        return {
            "-": { name: "Not Applicable" },
            A: { name: "Headquarters", sidc: "SFGP------A" },
            B: { name: "Task Force HQ", sidc: "SFGP------B" },
            C: { name: "Feint Dummy HQ", sidc: "SFGP------C" },
            D: { name: "Feint Dummy/Task Force HQ", sidc: "SFGP------D" },
            E: { name: "Task Force", sidc: "SFGP------E" },
            F: { name: "Feint Dummy", sidc: "SFGP------F" },
            G: { name: "Feint Dummy/Task Force", sidc: "SFGP------G" }
        };
    }
    if (battledimension == "GRDTRK_EQT") {
        return {
            "-": { name: "Unspecified" },
            M: { name: "Mobility" }
        };
    }
    if (battledimension == "GRDTRK_INS") {
        return {
            H: { name: "Installation", sidc: "SFGP------H" }
        };
    }
    if (battledimension == "SSUF" || battledimension == "SBSUF") {
        return {
            "-": { name: "Unspecified" },
            N: { name: "Towed array" }
        };
    }

    return { "-": { name: "-" } };
}
export function modifier2(battledimension = '', modifier1 = '') {
    if (battledimension == "GRDTRK_UNT" || battledimension == "SOFUNT") {
        return {
            "-": { name: "Unspecified" },
            A: { name: "Team/Crew", sidc: "SFGP-------A" },
            B: { name: "Squad", sidc: "SFGP-------B" },
            C: { name: "Section", sidc: "SFGP-------C" },
            D: { name: "Platoon/Detachment", sidc: "SFGP-------D" },
            E: { name: "Company/Battery/Troop", sidc: "SFGP-------E" },
            F: { name: "Battalion/Squadron", sidc: "SFGP-------F" },
            G: { name: "Regiment/Group", sidc: "SFGP-------G" },
            H: { name: "Brigade", sidc: "SFGP-------H" },
            I: { name: "Division", sidc: "SFGP-------I" },
            J: { name: "Corps/Mef", sidc: "SFGP-------J" },
            K: { name: "Army", sidc: "SFGP-------K" },
            L: { name: "Army Group/Front", sidc: "SFGP-------L" },
            M: { name: "Region", sidc: "SFGP-------M" },
            N: { name: "Command", sidc: "SFGP-------N" }
        };
    }
    if (battledimension == "GRDTRK_EQT" && modifier1 == "M") {
        return {
            O: { name: "Wheeled/Limited", sidc: "SFGPE-----MO" },
            P: { name: "Wheeled", sidc: "SFGPE-----MP" },
            Q: { name: "Tracked", sidc: "SFGPE-----MQ" },
            R: { name: "Wheeled And Tracked", sidc: "SFGPE-----MR" },
            S: { name: "Towed", sidc: "SFGPE-----MS" },
            T: { name: "Railway", sidc: "SFGPE-----MT" },
            U: { name: "Over The Snow", sidc: "SFGPE-----MU" },
            V: { name: "Sled", sidc: "SFGPE-----MV" },
            W: { name: "Pack Animals", sidc: "SFGPE-----MW" },
            Y: { name: "Barge", sidc: "SFGPE-----MY" },
            Z: { name: "Amphibious", sidc: "SFGPE-----MZ" }
        };
    }
    if ((battledimension == "SSUF" || battledimension == "SBSUF") && modifier1 == "N") {
        return {
            S: { name: "Towed Array (short)", sidc: "SFSPE-----NS" },
            L: { name: "Towed Array (long)", sidc: "SFSPE-----NL" }
        };
    }

    return { "-": { name: "-" } };
}

const std = {
    affiliations: affiliations,
    dimensions: dimensions,
    statuses: statuses,
    roles: roles,
    rolesGrouped: rolesGrouped,
    modifier1: modifier1,
    modifier2: modifier2,
    getDimensionLetter: (dimension) => app6b.WAR[dimension].mainIcon[0].battledimension,
};

export default std;