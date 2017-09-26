import assert from 'assert';

/**
 * @module comparator
 */

/**
 * A Comparator class. This will have static methods, each one will be used as comparator
 * @class
 */
class Comparator {
  /**
   * to validate if response time is less than a particular value
   * @param {object} response - the response object
   * @param {object} requirement - the requirement object
   */
  static responseTimeLessThan(response, requirement) {
    assert(response.responseTime < requirement.value);
  }

  /**
   * to validate if status code is equal to a particular value
   * @param {object} response - the response object
   * @param {object} requirement - the requirement object
   */
  static statusCode(response, requirement) {
    assert.equal(response.statusCode, requirement.value);
  }

  /**
   * to validate if response content contains a particular text
   * @param {object} response - the response object
   * @param {object} requirement - the requirement object
   */
  static contains(response, requirement) {
    assert(response.content.indexOf(requirement.value) !== -1);
  }
}

export default Comparator;
