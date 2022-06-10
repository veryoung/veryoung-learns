#include <iostream>
using namespace std;

int dat[100];
int nxt[100];

void add(int idx, int p, int val) {
    nxt[idx] = p;
    dat[p] = val;
 };

int main() {
    int head = 3;
    dat[3] = 0;
    add(3, 5 , 1);
    add(5, 2 , 2);
    add(2, 7 , 3);
    add(7, 4 , 4);
    add(4, 6 , 5);
    int p = head;
    while(p!= 0) {
        cout << dat[p] << " ";
        p = nxt[p];
    }
    cout << endl;
    return 0;
}
