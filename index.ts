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
 *
 *
 * @interface ThenFun
 */
interface ThenFun {
  (ans: any): any | Promise<any>;
}

// Promise的状态
type Prom1seStatus = "pending" | "completed" | "failed";

/**
 * Promise pollyfill
 *
 * @class Prom1se
 */
class Prom1se {
  /**
   * 保存Promise状态
   *
   * @private
   * @memberof Prom1se
   */
  private status: Prom1seStatus = "pending";
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
    this.status = "completed";
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
    this.status = "failed";
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
   * @returns {Prom1se}
   * @memberof Prom1se
   */
  public then(thenFun: ThenFun): Prom1se {
    const self = this;
    return new Prom1se((resolve, reject) => {
      /**
       * 实际的resolve执行
       *
       * @param {*} ans
       */
      function execResolve(ans: any) {
        const thenFunRes = thenFun(ans);
        if (thenFunRes instanceof Prom1se) {
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
      if(self.status = "completed") {
        execResolve(this.execRes);
      } else {
        self.resolveQueue.push(execResolve);
      }
      if(self.status = "failed") {
        // TODO
        // execReject(err)
      } else {
        self.rejectQueue.push(execReject);
      }

    });
  }
}

/**
 * 测试实现的Promise是否能正常工作
 *
 */
function main() {
  const pms = new Prom1se((resolve, reject) => {
    setTimeout(() => {
      resolve(2);
    }, 1000);
  });
  const haha = pms.then(res => {
    console.log(res);
    return new Prom1se(resolve => {
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

}

main();
