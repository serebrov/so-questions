That's an interesting question, so I dug into a small research. Actually some of the calls you make behave according to the documentation, but some others are rare in the real life and not documented, so we can treat them as a PHP implementation detail.

First, you should not use the `::` operator on the non-static methods, as the PHP notification states, this is deprecated behavior.

So let's split your test into two separate tests - one for non-static methods and another one for static methods.
Here is non-static methods test:

    class ParentClass{
        public function test($childObj){
            $childObj->getProtected();
            $childObj->getPrivate();
        }
        private function getPrivate(){
            echo "ParentClass private";
        }
        protected function getProtected(){
            echo "ParentClass protected";
        }
    }

    class ChildClass extends ParentClass{
        private function getPrivate(){
            echo "ChildClass private";
        }
        protected function getProtected(){
            echo "ChildClass protected";
        }
    }

    (new ParentClass)->test(new ChildClass());

It outputs:

> ChildClass protected

> ParentClass private

And here is the relevant part from the [php documentation](http://php.net/manual/en/language.oop5.visibility.php):

> Objects of the same type will have access to each others private and protected members even though they are not the same instances. This is because the implementation specific details are already known when inside those objects.

In the frist case, `$childObj->getProtected();` - it works, as the `$childObj` is a sub-type of the `ParentClass`, so it can be treated as an object of the same type.
So here we are:

1. Treating the `$childObj` variable as being of the `ParentClass` type
2. Calling the `getProtected()` method
3. This method is protected, so inheritance rules are applied and we call the child class implementation
4. We get the "ChildClass protected" output

When we try to do the same thing with the private method, we are still allowed to call `$childObj->getPrivate()`, but in this case inheritance rules are not applied, as the private members / methods can not be used through the inheritance. So at this point we are:

1. Treating the `$childObj` variable as being ParentClass type
2. Calling the `getPrivate()` method
3. Since it is private, inheritance rules are not applied (although, this the language implementation detail, see below) and we call the ParentClass implementation
4. We get the "ParentClass private" output

Now, for the static method method we are calling the class-level method, not the instance-level, so no inheritance rules are applicable here.

I think, it is clearer if we write the code for the static calls this way (we don't really need the object instance, we only need a class name):

    class ParentClass{
        public static function test() {
            ChildClass::getProtected();
            ChildClass::getPrivate();
        }
    }

    class ChildClass extends ParentClass{
        private static function getPrivate(){
            echo "ChildClass private";
        }
        protected static function getProtected(){
            echo "ChildClass protected";
        }
    }
    (new ParentClass)->test();

It outputs:

> ChildClass protected

> PHP Fatal error:  Uncaught Error: Call to private method ChildClass::getPrivate() from context 'ParentClass'

I think, it's obvious here why the second call raises an error - we are just trying to call the private staic method of another class.

It's more interesting why the first call, `ChildClass::getProtected()`, works, as we are also trying to call a protected method of another class and inheritance rules should not apply here.

The only explanation I can find is that's just an implementation detail of the language.
I think this protected method call shouldn't really work.

I also tried to compare this to C++, here is what I get for [the first test](https://ideone.com/3BKNhM):

    #include <iostream>
    using namespace std;

    class ParentClass {
        public:
            void test(ParentClass* obj);
        protected:
            virtual void getProtected();
        private:
            virtual void getPrivate();
    };

    class ChildClass: public ParentClass{
        protected:
            virtual void getProtected();
        private:
            virtual void getPrivate();
    };


    //private virtual
    void ParentClass::getPrivate(){
        cout << "ParentClass private";
    }
    //protected virtual
    void ParentClass::getProtected(){
        cout << "ParentClass protected";
    }
    //public
    void ParentClass::test(ParentClass* obj) {
        obj->getProtected();
        obj->getPrivate();
    };

    //private virtual
    void ChildClass::getPrivate(){
        cout << "ChildClass private";
    }
    //protected virtual
    void ChildClass::getProtected(){
        cout << "ChildClass protected";
    }

    int main() {
        cout << "test";
        (new ParentClass)->test(new ChildClass);
    }

And it outputs:

> test

> ChildClass protected

> ChildClass private

So it works for the private method differently than in PHP and C++ actually calls the child class implementation even for the private method.

The second test for static methods:

    #include <iostream>
    using namespace std;

    class ParentClass {
        public:
            static void test();
    };

    class ChildClass: public ParentClass{
        protected:
           static void getProtected();
        private:
            static void getPrivate();
    };

    //public static
    void ParentClass::test() {
        // error: 'static void ChildClass::getProtected()' is protected
        //ChildClass::getProtected();
        // error: 'static void ChildClass::getPrivate()' is private
        //ChildClass::getPrivate();
    };

    //private static
    void ChildClass::getPrivate(){
        cout << "ChildClass private";
    }
    //protected static
    void ChildClass::getProtected(){
        cout << "ChildClass protected";
    }


    int main() {
        cout << "test";
        (new ParentClass)->test();
    }

Both protected and private calls do not work here. You can't even compile a program with these calls.

This is I think more logical than in PHP where you can call the protected static method.
