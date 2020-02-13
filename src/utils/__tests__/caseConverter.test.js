import caseConverter from '../caseConverter';

const snakeCaseTestData = {
  fisrt_param: 1,
  second_param: {
    third_param: 3,
    fourth_param: {
      fifth_param: 5,
      sixth_param: [{ seventh_param: [1, 2, 3], eighth_param: 'ahihi' }],
    },
  },
};

const camelCaseTestData = {
  fisrtParam: 1,
  secondParam: {
    thirdParam: 3,
    fourthParam: {
      fifthParam: 5,
      sixthParam: [{ seventhParam: [1, 2, 3], eighthParam: 'ahihi' }],
    },
  },
};

describe('utils/caseConverter', () => {
  it('can convert from snake case to camel case', () => {
    const camelCaseData = caseConverter.snakeCaseToCamelCase(snakeCaseTestData);
    expect(camelCaseData).toEqual(camelCaseTestData);
  });

  it('can convert from camel case to snake case', () => {
    const snakeCaseData = caseConverter.camelCaseToSnakeCase(camelCaseTestData);
    expect(snakeCaseData).toEqual(snakeCaseTestData);
  });

  it('should return null if argument is a primitive variable', () => {
    let snakeCaseData = caseConverter.camelCaseToSnakeCase(10);
    expect(snakeCaseData).toEqual(null);
    snakeCaseData = caseConverter.camelCaseToSnakeCase('gotit');
    expect(snakeCaseData).toEqual(null);
    snakeCaseData = caseConverter.camelCaseToSnakeCase(null);
    expect(snakeCaseData).toEqual(null);
  });

  it('should return null if argument is a function', () => {
    const snakeCaseData = caseConverter.camelCaseToSnakeCase(() => {});
    expect(snakeCaseData).toEqual(null);
  });
});
