export type ProductExperience = {
  marketingName: string;
  subtitle: string;
  emotionalCopy: string;
  cardCopy: string;
  physicalLabel: string;
  occasions: string[];
};

const experiences: Record<string, ProductExperience> = {
  'smart-photo-slate': {
    marketingName: 'Forever Memory Slate',
    subtitle:
      'A beautiful personalised keepsake for the moments you never want to lose.',
    emotionalCopy:
      'Keep a favourite photograph on display, then let one simple tap bring the words and voice behind the moment back to life.',
    cardCopy:
      'A personalised photo slate with a Smart Memory they can tap and hear.',
    physicalLabel:
      'Personalised photo slate',
    occasions: [
      'Birthday',
      'Anniversary',
      'Wedding',
      'Family',
      'Grandparents',
      'Pet Memory',
      'Memorial',
      'Christmas',
    ],
  },

  'smart-memory-plaque': {
    marketingName: 'Smart Memory Plaque',
    subtitle:
      'A modern personalised keepsake with a story waiting behind the tap.',
    emotionalCopy:
      'Turn a favourite photograph and meaningful words into a display piece that connects to the voice and story behind it.',
    cardCopy:
      'A modern photo plaque connected to a personal Smart Memory.',
    physicalLabel:
      'Personalised aluminium plaque',
    occasions: [
      'Anniversary',
      'Wedding',
      'Family',
      'Grandparents',
      'Memorial',
      'Retirement',
      'Christmas',
    ],
  },

  'photo-mug': {
    marketingName: 'Smart Memory Mug',
    subtitle:
      'More than a photo mug.',
    emotionalCopy:
      'A personalised gift they can use every day and tap whenever they want to return to your photograph, message and voice.',
    cardCopy:
      'An everyday photo mug with a memory waiting behind the tap.',
    physicalLabel:
      'Personalised photo mug',
    occasions: [
      'Birthday',
      'Mum',
      'Dad',
      'Anniversary',
      'Teacher',
      'Christmas',
      'Just Because',
    ],
  },

  'coaster-set': {
    marketingName:
      'Smart Memory Coaster Set',
    subtitle:
      'Everyday keepsakes that can hold more than a picture.',
    emotionalCopy:
      'Turn a useful personalised gift into something emotional by connecting the design to the story and voice behind it.',
    cardCopy:
      'Personalised coasters connected to a Smart Memory experience.',
    physicalLabel:
      'Personalised coaster set',
    occasions: [
      'Wedding',
      'Anniversary',
      'Birthday',
      'Family',
      'Christmas',
      'Just Because',
    ],
  },

  keyring: {
    marketingName:
      'Smart Memory Keyring',
    subtitle:
      'Carry the photograph. Tap back into the memory.',
    emotionalCopy:
      'A small keepsake that stays close every day, with a personal photograph, message and voice only one tap away.',
    cardCopy:
      'A compact keepsake carrying a photograph and Smart Memory.',
    physicalLabel:
      'Personalised photo keyring',
    occasions: [
      'Anniversary',
      'Mum',
      'Dad',
      'Family',
      'Pet Memory',
      'Memorial',
      'Just Because',
    ],
  },

  'mouse-mat': {
    marketingName:
      'Smart Memory Mouse Mat',
    subtitle:
      'A favourite moment on the desk, with the story one tap away.',
    emotionalCopy:
      'Make an everyday workspace personal with a favourite photograph and a Smart Memory connected to the people and moments behind it.',
    cardCopy:
      'A personalised desk gift with a Smart Memory built into the experience.',
    physicalLabel:
      'Personalised mouse mat',
    occasions: [
      'Dad',
      'Teacher',
      'Family',
      'Pet Memory',
      'Leaving Gift',
      'Retirement',
      'Christmas',
    ],
  },

  'white-t-shirt': {
    marketingName:
      'Smart Memory T-Shirt',
    subtitle:
      'Wear the moment. Keep the story connected.',
    emotionalCopy:
      'Create a personalised T-shirt around a photograph, design or message, with a Smart Memory that adds your voice and story.',
    cardCopy:
      'A personalised T-shirt with a digital memory connected to the story.',
    physicalLabel:
      'Personalised white T-shirt',
    occasions: [
      'Birthday',
      'Graduation',
      'Party',
      'Family',
      'Leaving Gift',
      'Christmas',
    ],
  },
};

const fallback: ProductExperience = {
  marketingName:
    'Smart Memory Gift',
  subtitle:
    'A personalised gift with more behind the photograph.',
  emotionalCopy:
    'Create a physical personalised gift and connect it to a meaningful Smart Memory.',
  cardCopy:
    'A personalised physical gift connected to a Smart Memory.',
  physicalLabel:
    'Personalised gift',
  occasions: [
    'Birthday',
    'Anniversary',
    'Family',
    'Just Because',
  ],
};

export function getProductExperience(
  slug: string
): ProductExperience {
  return experiences[slug] || fallback;
}