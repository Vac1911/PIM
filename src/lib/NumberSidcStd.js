import {ms2525d} from "./mil-std-2525-master";
import {app6b} from "./stanag-app6-master";

export const set = [
    {name: 'version', length: 2, options: [['Standard', '10']]},
    {name: 'context', length: 1, options: [['Reality', '0'], ['Exercise', '1'], ['Simulation', '2']]},
    {name: 'affiliation', length: 1, options: [['Pending', '0'], ['Unknown', '1'], ['Assumed Friend', '2'], ['Friend', '3'], ['Neutral', '4'], ['Suspect/Joker', '5'], ['Hostile/Faker', '6']]},
    {name: 'set', length: 2, options: Object.values(ms2525d).map((set) => [set.name, set.symbolset])},
    {name: 'status', length: 1, options: [['Present', '0'], ['Planned/Anticipated', '1'], ['Present/Fully Capable', '2'], ['Present/Damaged', '3'], ['Present/Destroyed', '4'], ['Present/Full to Capacity', '5']]},
    {name: 'mod', length: 1, options: [['None', '0'], ['Feint/Dummy', '1'], ['Headquarters', '2'], ['Feint/Dummy Headquarters', '3'], ['Task Force', '4'], ['Feint/Dummy Task Force', '5'], ['Task Force Headquarters', '6'], ['Feint/Dummy Task Force Headquarters', '7']]},
    {name: 'amplifier', length: 2, options: getAmplifiers},
    {name: 'entity', length: 2, options: getEntities},
    {name: 'type', length: 2, options: getTypes},
    {name: 'subtype', length: 2, options: getSubTypes},
    {name: 'modifier1', length: 2, options: getModifier1},
    {name: 'modifier2', length: 2, options: getModifier2},
];

function getAmplifiers(set) {
    if (set == "10") {
        return [
            ["Unspecified", "00"],
            ["Team/Crew", "11"],
            ["Squad", "12"],
            ["Section", "13"],
            ["Platoon/Detachment", "14"],
            ["Company/Battery/Troop", "15"],
            ["Battalion/Squadron", "16"],
            ["Regiment/Group", "17"],
            ["Brigade", "18"],
            ["Division", "21"],
            ["Corps/MEF", "22"],
            ["Army", "23"],
            ["Army Group/Front", "24"],
            ["Region/Theater", "25"],
            ["Command", "26"],
        ];
    }
    // add signals intelligence
    if (set == "15") {
        return [
            ["Unspecified", "00"],
            ["Wheeled limited cross country", "31"],
            ["Wheeled cross country", "32"],
            ["Tracked", "33"],
            ["Wheeled and tracked combination", "34"],
            ["Towed", "35"],
            ["Railway", "36"],
            ["Pack animals", "37"],
            ["Over snow (prime mover)", "41"],
            ["Sled", "42"],
            ["Barge", "51"],
            ["Amphibious", "52"],
        ];
    }
    if (set == "27") {
        return [
            ["Unspecified", "00"],
            ["Leader", "71"],
        ];
    }
    if (set == "30" || set == "35") {
        return [
            ["Unspecified", "00"],
            ["Short towed array", "61"],
            ["Long towed array", "62"],
        ];
    }

    return [];
}

function getEntities(set = '') {
    if(!set)
        return [["-", "00"]];
    return ms2525d[set].mainIcon.filter(u => u.Code.endsWith("0000")).map(e => [e.Entity, e.Code.slice(0, 2)]);
}

function getTypes(set = '', entity = '') {
    if(!set || !entity)
        return [["-", "00"]];
    return ms2525d[set].mainIcon.filter(u => u.Code.startsWith(entity) && u.Code.endsWith("00")).map(e => [e["Entity Type"], e.Code.slice(2, 4)]);
}

function getSubTypes(set = '', entity = '', type = '') {
    if(!set || !entity || !type)
        return [["-", "00"]];
    return ms2525d[set].mainIcon.filter(u => u.Code.startsWith(entity + type)).map(e => [e["Entity Subtype"], e.Code.slice(4)]);
}

function getModifier1(set = '') {
    if(!set)
        return [["-", "00"]];
    return ms2525d[set].modifier1.map(m => [m['First Modifier'] || m['Second Modifier'], m.Code]);
}

function getModifier2(set = '') {
    if(!set)
        return [["-", "00"]];
    return ms2525d[set].modifier2.map(m => [m['First Modifier'] || m['Second Modifier'], m.Code]);
}

export default {
    std: ms2525d,
    set: set,
    options: (name) => set.find(s => s.name === name).options,
};