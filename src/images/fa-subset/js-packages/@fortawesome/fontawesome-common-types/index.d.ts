export type IconPrefix = "fas" | "fab" | "far" | "fal" | "fad";
export type IconPathData = string | string[]

export interface IconLookup {
  prefix: IconPrefix;
  // IconName is defined in the code that will be generated at build time and bundled with this file.
  iconName: IconName;
}

export interface IconDefinition extends IconLookup {
  icon: [
    number, // width
    number, // height
    string[], // ligatures
    string, // unicode
    IconPathData // svgPathData
  ];
}

export interface IconPack {
  [key: string]: IconDefinition;
}

export type IconName = 'arrow-alt-down' | 
  'arrow-alt-up' | 
  'bus' | 
  'bus-alt' | 
  'car' | 
  'car-side' | 
  'circle' | 
  'clock' | 
  'edit' | 
  'print' | 
  'sack' | 
  'slash' | 
  'spinner' | 
  'spinner-third' | 
  'user' | 
  'arrow-alt-down' | 
  'arrow-alt-up' | 
  'circle' | 
  'info-square' | 
  'long-arrow-down' | 
  'long-arrow-up' | 
  'ban' | 
  'check' | 
  'edit' | 
  'hand-holding' | 
  'plus' | 
  'pound-sign' | 
  'slash' | 
  'tenge' | 
  'times' | 
  'user-plus';
