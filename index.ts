import _ from "lodash/fp";

/**
 *
 *
 * @interface ConstructFun
 */
interface ConstructFun {
  (resolve: Function, reject: Function): void;
}

/**
 * 作为参数传递给then函数的函数
 *
 * @interface ThenFun
 */
interface ThenFun {
  (ans: any): any | Promise<any>;
}

/**
 * Promise状态
 *
 * @enum {number}
 */
enum Prom1seStatus {
  "pending",
  "completed",
  "failed"
}

/**
 * Promise pollyfill
 *
 * @class Prom1se
 */
class Prom1seBase {
  /**
   * 保存Promise状态
   *
   * @private
   * @memberof Prom1se
   */
  private status: Prom1seStatus = Prom1seStatus.pending;
  /**
   * resolve需要执行的队列
   *
   * @private
   * @type {Function[]}
   * @memberof Prom1se
   */
  private resolveQueue: Function[] = [];
  /**
   * reject需要执行的队列
   *
   * @private
   * @type {Function[]}
   * @memberof Prom1se
   */
  private rejectQueue: Function[] = [];
  /**
   *
   *
   * @private
   * @type {(Function | undefined)}
   * @memberof Prom1se
   */
  private rejectFun: Function | undefined;
  /**
   * 当Promise不再是pending时
   *
   * @private
   * @type {*}
   * @memberof Prom1se
   */
  private execRes: any;
  /**
   * Creates an instance of Prom1se.
   * @param {ConstructFun} fun
   * @memberof Prom1se
   */
  public constructor(fun: ConstructFun) {
    const self = this;
    /**
     * 传递给参数函数的resolve方法
     *
     * @param {*} ans
     */
    function resolve(ans: any) {
      self.execResolve(ans);
    }
    /**
     * 传递给参数函数的reject方法
     *
     * @param {*} err
     */
    function reject(err: any) {
      // TODO
    }
    fun(resolve, reject);
  }
  /**
   * resolve方法的实际执行
   *
   * @private
   * @param {*} ans
   * @memberof Prom1se
   */
  private execResolve(ans: any): void {
    this.status = Prom1seStatus.completed;
    this.execRes = ans;
    _.forEach((cb: Function) => {
      cb(ans);
    })(this.resolveQueue);
  }
  /**
   * reject方法的实际执行
   *
   * @private
   * @param {*} err
   * @memberof Prom1se
   */
  private execReject(err: any): void {
    this.status = Prom1seStatus.failed;
  }
  /**
   *
   *
   * @param {Function} errCb
   * @memberof Prom1se
   */
  public catch(errCb: Function) {
    this.rejectFun = errCb;
  }
  /**
   * then方法，会返回一个全新的Prom1se实例
   *
   * @param {ThenFun} thenFun
   * @returns {Prom1seBase}
   * @memberof Prom1se
   */
  public then(thenFun: ThenFun): Prom1seBase {
    const self = this;
    return new Prom1seBase((resolve, reject) => {
      /**
       * 实际的resolve执行
       *
       * @param {*} ans
       */
      function execResolve(ans: any) {
        const thenFunRes = thenFun(ans);
        if (thenFunRes instanceof Prom1seBase) {
          //TODO
          thenFunRes.then(resolve as any);
        } else {
          resolve(thenFunRes);
        }
      }
      /**
       * 实际的reject执行
       *
       * @param {*} err
       */
      function execReject(err: any) {
        // TODO
      }
      if (Prom1seStatus.completed === self.status) {
        execResolve(this.execRes);
      } else {
        self.resolveQueue.push(execResolve);
      }
      if (Prom1seStatus.failed === self.status) {
        // TODO
        // execReject(err)
      } else {
        self.rejectQueue.push(execReject);
      }
    });
  }
}

class Prom1se extends Prom1seBase {
  public static resolve(res: any) {
    return new Prom1se((resolve: Function) => {
      resolve(res);
    })
  }
  public static all(pmsArr: Prom1se[]) {

  }
}

/**
 * 测试实现的Promise是否能正常工作
 *
 */
function main() {
  const pms = new Prom1seBase((resolve, reject) => {
    setTimeout(() => {
      resolve(2);
    }, 1000);
  });
  const haha = pms.then(res => {
    console.log(res);
    return new Prom1seBase(resolve => {
      setTimeout(() => {
        resolve("haha");
      }, 3000);
    });
  });

  haha.then(res => {
    console.log(res);
  });
}

/**
 * TODO: 测试Promise实现是否是不可变数据结构！！
 *
 */
function test4Promise() {
  // 证明Promise并非Immutable
  const originalObj = {
    a: 2
  };
  const pms = new Promise<any>((resvole, reject) => {
    resvole(originalObj);
  });
  pms.then(res => {
    res.b = "bbb";
    console.log(originalObj);
  });
  pms.then(res => {
    res.c = "ccc";
    console.log(originalObj);
  });
}

// main();
test4Promise();
